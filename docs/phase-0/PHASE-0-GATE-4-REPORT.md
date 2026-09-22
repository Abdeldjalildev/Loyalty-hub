# Phase 0 — Gate 4 Architecture Decision

**Status: PASS / CLOSED**

## 1. Decision summary

LoyaltyHub will use a deliberately small Firebase architecture:

- **Frontend:** React + TypeScript + Vite + Tailwind.
- **Identity:** Firebase Authentication.
- **Primary persistence:** Cloud Firestore.
- **Sensitive business operations:** Firebase Cloud Functions.
- **Direct data authorization:** Firestore Security Rules.
- **Local backend verification:** Firebase Emulator Suite.
- **Frontend deployment:** existing Vercel deployment model.
- **Backend environments:** separate Firebase projects/environments for development, staging/preview where required, and production.

No custom backend server, Express API, custom JWT system, Redis, Docker, or separate database is introduced.

This gate defines architecture only. Firebase integration remains Phase 1 work.

---

## 2. Runtime boundaries

### Browser / React application

The browser is responsible for:
- rendering UI;
- collecting user input;
- displaying authenticated data;
- initiating authorized application operations;
- scanner/camera interaction;
- local UI preferences.

The browser is **not** trusted for:
- merchant ownership;
- customer ownership;
- point balances;
- reward costs;
- transaction totals;
- authorization decisions;
- final redemption success.

### Firebase Authentication

Firebase Authentication provides:
- merchant authentication;
- customer email + password authentication;
- authenticated session identity.

Authentication proves identity; it does not by itself prove tenant ownership.

### Firestore

Firestore is the persistent source of truth for:
- merchant/business data;
- customer records;
- loyalty programs;
- rewards;
- transactions;
- redemptions;
- QR security artifacts;
- merchant identity/tenant mapping;
- controlled audit metadata.

### Cloud Functions

Cloud Functions are the authoritative execution boundary for sensitive mutations, especially:
- merchant/customer enrollment operations requiring trusted checks;
- point issuance;
- reward redemption;
- QR token validation;
- operations requiring atomic multi-document writes;
- server-side validation and normalization where appropriate.

---

## 3. Firestore logical structure

The following structure is the approved logical model for Phase 1 implementation:

```text
/merchants/{merchantId}
    /customers/{customerId}
    /loyaltyPrograms/{programId}
    /rewards/{rewardId}
    /transactions/{transactionId}
    /redemptions/{redemptionId}
    /qrTokens/{qrTokenId}

/merchantUsers/{authUid}

/customerUsers/{authUid}
```

### Merchant document

Stores merchant-owned profile/configuration and the owner identity association.

Core responsibilities:
- tenant identity;
- ownerAuthUid;
- business profile;
- branding;
- lifecycle status;
- server timestamps.

### Customer subcollection

Path:
`/merchants/{merchantId}/customers/{customerId}`

Contains merchant-owned customer records.

The merchant ID in the path is a primary isolation boundary.

### Loyalty programs

Path:
`/merchants/{merchantId}/loyaltyPrograms/{programId}`

MVP allows one active program per merchant.

### Rewards

Path:
`/merchants/{merchantId}/rewards/{rewardId}`

Each reward carries its program reference and is tenant-scoped by path.

### Transactions

Path:
`/merchants/{merchantId}/transactions/{transactionId}`

Transactions are append-only business records.

### Redemptions

Path:
`/merchants/{merchantId}/redemptions/{redemptionId}`

Redemptions reference the customer, reward and authoritative transaction.

### QR tokens

Path:
`/merchants/{merchantId}/qrTokens/{qrTokenId}`

Security-sensitive QR artifacts are tenant-scoped and are never treated as public authorization records.

### Identity mappings

`/merchantUsers/{authUid}` maps an authenticated merchant identity to its merchant tenant and role.

`/customerUsers/{authUid}` maps an authenticated customer identity to its enrolled customer and merchant context.

These mapping documents are authorization infrastructure, not user-editable profile data.

---

## 4. Tenant isolation model

Merchant is the root tenant boundary.

For an authenticated merchant:
1. Authentication provides `auth.uid`.
2. `merchantUsers/{auth.uid}` resolves the authorized merchant tenant.
3. Every protected Firestore path is scoped to that merchant.
4. Security Rules verify the authenticated identity and ownership.
5. Sensitive mutations additionally resolve and validate ownership inside Cloud Functions.

A client cannot select an arbitrary `merchantId` and thereby become a member of that tenant.

Cross-tenant access must fail for both:
- direct Firestore reads/writes;
- Cloud Function operations.

Customer isolation follows the same principle:
- authenticated customer → `customerUsers/{auth.uid}` → exactly one authorized customer context;
- customer-facing reads are restricted to that customer;
- customer cannot substitute another `customerId`.

---

## 5. Security Rules boundary

Security Rules are a database access boundary, not the complete business-logic layer.

Rules will enforce:
- authenticated access where required;
- merchant-user ownership;
- customer-user ownership;
- tenant path consistency;
- allowed read/write surfaces;
- denial by default for protected collections.

Rules will **not** be relied upon as the only mechanism for complex financial/business mutations.

Sensitive point-changing writes will be denied as arbitrary client document writes.

Clients will not directly write:
- customer points balance;
- transactions;
- successful redemptions;
- authoritative reward cost during redemption;
- tenant ownership;
- actor identity;
- server timestamps for authoritative audit fields.

Cloud Functions will perform those operations with server authority.

---

## 6. Points and redemption architecture

### Points issuance

```text
Merchant UI
   ↓
Authenticated request
   ↓
Cloud Function
   ↓
Resolve merchant identity
   ↓
Validate customer ownership
   ↓
Validate positive integer points
   ↓
Read current authoritative customer balance
   ↓
Write updated balance + immutable transaction atomically
   ↓
Return verified result
   ↓
UI updates
```

### Redemption

```text
Merchant UI
   ↓
Authenticated request
   ↓
Cloud Function
   ↓
Resolve merchant identity
   ↓
Validate customer ownership
   ↓
Validate reward ownership/status
   ↓
Read authoritative reward.pointsCost
   ↓
Read authoritative customer balance
   ↓
Verify sufficient balance
   ↓
Atomic write:
  - new customer balance
  - redemption
  - transaction
   ↓
Return verified result
   ↓
UI reports success
```

The client never supplies the authoritative reward cost for the mutation.

Firestore transaction/batched atomicity will be used according to the operation's consistency requirements. Concurrent redemption attempts must not be able to spend the same points twice.

---

## 7. Transaction architecture

Transaction documents are append-only.

A transaction records at minimum:
- transactionId;
- merchantId;
- customerId;
- type;
- pointsDelta;
- balanceBefore;
- balanceAfter;
- rewardId when applicable;
- redemptionId when applicable;
- actorType;
- actorId;
- server createdAt;
- idempotency/replay metadata where required.

Normal clients receive read access appropriate to their role but cannot rewrite historical point effects.

Corrections, if ever required, use compensating business records rather than rewriting historical truth.

---

## 8. QR architecture

The current raw-customer-ID QR approach is explicitly rejected for production.

### Approved model

The customer-facing QR will contain an **opaque server-issued QR artifact**, not a raw `customerId`.

The artifact will:
- identify a server-side QR record;
- be bound to one merchant/customer context;
- contain no trusted balance or reward cost;
- be revocable/rotatable;
- support expiry/rotation where the final UX requires it;
- be validated server-side.

The scanner merely submits the decoded artifact.

The server then validates:
- authenticated merchant;
- QR artifact validity;
- merchant binding;
- customer binding;
- status/expiry;
- replay/idempotency requirements;
- requested business operation.

Possession of the QR string alone never authorizes a point mutation or redemption.

### Replay protection

The QR identity mechanism is separated from transaction authorization.

A repeated scan may identify the same customer, but it cannot itself perform a financial/loyalty mutation. Every mutation requires a fresh authenticated server request and its own business validation.

If a future flow requires single-use redemption tokens, those tokens will be separately modeled and atomically consumed.

---

## 9. Customer authentication architecture

MVP customer self-service uses Firebase Authentication email-link/passwordless sign-in.

Flow:

```text
Merchant enrolls customer with email
        ↓
Customer receives sign-in link
        ↓
Firebase Auth establishes auth.uid
        ↓
customerUsers/{auth.uid} resolves customer + merchant
        ↓
Customer portal loads only authorized customer data
```

A customer record without an enrolled email-linked identity can remain merchant-managed but cannot use the self-service portal.

Customer authentication does not grant merchant permissions.

---

## 10. Merchant authentication architecture

Merchant owner authentication uses Firebase Authentication.

After authentication:
- `merchantUsers/{auth.uid}` maps the user to one merchant tenant;
- role is currently `OWNER`;
- tenant ownership is not accepted from browser input;
- disabled merchants cannot perform normal business mutations.

MVP does not introduce staff roles.

---

## 11. Environment architecture

The project will use environment separation rather than one shared Firebase backend.

### Development
- local Vite frontend;
- Firebase Emulator Suite;
- development Firebase project for flows that cannot be emulated;
- no production customer data.

### Preview / staging
- isolated Firebase environment;
- Vercel preview deployment;
- test/demo data only;
- no production credentials.

### Production
- dedicated production Firebase project;
- production Firestore/Auth/Functions;
- Vercel production frontend;
- production-only secrets/configuration.

Exact project IDs and credentials are implementation details for Phase 1 and must never be committed to source control.

---

## 12. Configuration and secrets

Public Firebase web configuration may be exposed to the frontend where required by Firebase's architecture, but authorization and secret material must not be placed there.

Rules:
- no service-account JSON in Git;
- no private keys in frontend bundles;
- no production credentials in repository;
- no emulator data/credentials committed;
- server secrets use Firebase/Vercel-supported secret/configuration mechanisms;
- `.env.local` and other local secret files remain ignored.

The frontend may know public project configuration; it must never receive server credentials.

---

## 13. Emulator strategy

Firebase Emulator Suite is the deterministic local verification boundary for:
- Authentication;
- Firestore;
- Cloud Functions;
- Security Rules.

Phase 1 will establish emulator configuration before production backend behavior is introduced.

Security-sensitive tests should run against emulators where practical so cross-tenant and unauthorized scenarios can be reproduced without touching production data.

---

## 14. Frontend/backend boundary

The existing React contexts/components remain the presentation layer during migration.

The architecture does **not** require an immediate rewrite.

Migration direction:

```text
Current:
React Context → localStorage / frontend state

Target:
React UI
   ↓
Firebase Auth / authorized reads
   ↓
Firestore for permitted reads
   +
Cloud Functions for sensitive mutations
   ↓
Firestore authoritative data
```

The existing UI can be incrementally migrated during later phases.

No Phase 0 source-code migration is required.

---

## 15. Existing defects mapped to architecture

The architecture explicitly addresses the current known production blockers:

| Existing limitation | Architectural resolution |
|---|---|
| No authentication | Firebase Authentication |
| No tenant isolation | merchantUsers + tenant-scoped Firestore + Rules |
| localStorage source of truth | Firestore |
| client-controlled points | Cloud Functions |
| reward ID/cost mismatch | trusted reward lookup in redemption function |
| ephemeral transactions | persistent transaction collection |
| raw customer-ID QR | opaque server-issued QR artifact |
| customer simulator | authenticated customer identity mapping |
| client success before backend confirmation | verified function result required |

No defect is fixed during this gate because implementation begins in Phase 1+.

---

## 16. Architecture security invariants

The following are mandatory implementation constraints:

1. Authentication identity is never replaced by a client-supplied ID.
2. Tenant ownership is derived from trusted identity mapping.
3. Every protected record is tenant-scoped.
4. Sensitive writes are server-authoritative.
5. Point balance is never client-authoritative.
6. Reward cost is never taken from a client-supplied redemption amount.
7. Transaction history is append-only.
8. Cross-tenant reads and writes fail.
9. Customer-to-customer access fails.
10. QR possession alone never authorizes a mutation.
11. Server timestamps are authoritative for audit records.
12. Secrets never enter the frontend bundle or Git.
13. Production verification must not depend on production test data.
14. Concurrent redemptions must be handled atomically.
15. Failed mutations must not create successful business records.

---

## 17. Architecture decision

**APPROVED**

The architecture is sufficiently defined for Phase 1 implementation.

Next phase:
**Phase 1 — Production Foundation**

Phase 1 may introduce Firebase infrastructure. It must not expand the MVP domain without an explicit scope decision.

