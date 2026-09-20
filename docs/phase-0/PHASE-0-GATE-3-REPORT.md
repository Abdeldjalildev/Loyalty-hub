# Phase 0 — Gate 3 Closure Report
## Domain Model

**Status: PASS / CLOSED**

### 1. Gate objective

Gate 3 converts the approved MVP contract into a minimal, implementation-ready domain model.

The model defines:
- entities;
- ownership;
- relationships;
- lifecycle;
- immutable versus mutable fields;
- authoritative business data;
- audit requirements;
- boundaries needed for later Firebase implementation.

No Firebase collections, Functions, Rules, authentication configuration, or product UI changes were implemented in this gate.

---

## 2. Domain principles

1. **Merchant is the tenant root.** Every protected business record is owned by exactly one merchant tenant, directly or through an explicitly defined parent.
2. **Customer is a merchant-owned loyalty identity.** A customer record is not globally interchangeable between merchants.
3. **LoyaltyProgram is configuration, not a balance ledger.**
4. **Reward defines an entitlement/cost.** Its points cost is authoritative server-side.
5. **Transaction is the immutable loyalty ledger entry for point-changing activity.**
6. **Redemption records the business act of consuming a reward and references its transaction evidence.**
7. **QR identity/token is a security artifact, not a customer authorization boundary.**
8. **Audit metadata records who/what/when for sensitive mutations.**
9. **Points balance is derived/maintained from authoritative server-side transactions; it is never client-authoritative.**
10. **Historical records must remain attributable even if a customer or reward is later archived.**

---

## 3. Entity: Merchant

### Purpose
Tenant/business account that owns the loyalty program and all merchant-controlled loyalty data.

### Identity
- `merchantId` — immutable, server-generated unique identifier.

### Core fields
- `name` — mutable.
- `logoUrl` — mutable.
- `description` — mutable.
- `phone` — mutable.
- `contactLinks` — mutable, bounded configuration.
- `branding` — mutable, bounded configuration.
- `status` — mutable lifecycle state, initially active/disabled.
- `ownerAuthUid` — immutable association to the authenticated merchant owner.
- `createdAt` — immutable server timestamp.
- `updatedAt` — server-managed timestamp.

### Ownership
Merchant is the tenant root.

### Lifecycle
- created;
- active;
- disabled.

A disabled merchant must not be able to perform normal business mutations.

### Immutable fields
- `merchantId`;
- `ownerAuthUid`;
- `createdAt`.

### Mutable fields
Profile, branding, contact data, and lifecycle status, subject to authorization.

---

## 4. Entity: Customer

### Purpose
A customer loyalty record belonging to exactly one merchant.

### Identity
- `customerId` — immutable, server-generated unique identifier.

### Core fields
- `merchantId` — immutable ownership.
- `authUid` — nullable until customer portal enrollment is claimed; once linked, protected from arbitrary client changes.
- `name` — mutable.
- `email` — mutable under controlled identity rules; used as the portal enrollment/access anchor.
- `phone` — mutable.
- `status` — active/archived.
- `pointsBalance` — server-controlled authoritative current balance; clients cannot write it directly.
- `createdAt` — immutable server timestamp.
- `updatedAt` — server-managed timestamp.

### Ownership
Exactly one `merchantId`.

### Relationships
- belongs to one Merchant;
- optionally links to one authenticated customer identity;
- has many Transactions;
- has many Redemptions;
- may have QR identity/token artifacts.

### Lifecycle
- created;
- active;
- archived.

Archiving does not erase historical transactions/redemptions.

### Immutable fields
- `customerId`;
- `merchantId`;
- `createdAt`.

### Controlled fields
- `authUid`;
- `email`.

These must be changed only through an authorized identity/enrollment flow.

### Mutable fields
- name;
- phone;
- status;
- permitted profile metadata;
- server-controlled balance through domain operations only.

---

## 5. Entity: LoyaltyProgram

### Purpose
Defines the merchant's active loyalty rules.

### Identity
- `programId` — immutable, server-generated identifier.
- MVP relationship: one active program per merchant.

### Core fields
- `merchantId` — immutable owner.
- `name` — mutable.
- `description` — mutable.
- `pointsRule` — mutable through validated configuration.
- `status` — active/inactive.
- `createdAt` — immutable.
- `updatedAt` — server-managed.

### Ownership
Exactly one Merchant.

### Relationships
- belongs to one Merchant;
- has many Rewards;
- governs point-earning configuration.

### Lifecycle
- draft;
- active;
- inactive.

The MVP may simplify lifecycle handling if only one active program is supported, but the domain must not require multiple concurrent programs.

### Immutable fields
- programId;
- merchantId;
- createdAt.

### Mutable fields
- name;
- description;
- pointsRule;
- status.

---

## 6. Entity: Reward

### Purpose
Defines a reward that a customer may redeem using loyalty points.

### Identity
- `rewardId` — immutable, server-generated identifier.

### Core fields
- `merchantId` — immutable owner.
- `programId` — immutable parent.
- `name` / localized display names as required — mutable.
- `description` / localized descriptions as required — mutable.
- `pointsCost` — mutable only through authorized merchant configuration; used authoritatively by redemption logic.
- `status` — active/inactive.
- `createdAt` — immutable.
- `updatedAt` — server-managed.

### Ownership
Exactly one Merchant and one LoyaltyProgram.

### Relationships
- belongs to one LoyaltyProgram;
- belongs to one Merchant;
- referenced by Redemptions.

### Lifecycle
- active;
- inactive;
- optionally archived when implementation requires historical preservation.

A historical redemption must retain enough evidence to identify the reward used even if the current reward configuration later changes.

### Immutable fields
- rewardId;
- merchantId;
- programId;
- createdAt.

### Mutable fields
- display data;
- pointsCost;
- status.

---

## 7. Entity: Transaction

### Purpose
Immutable audit/ledger record for loyalty point-changing activity.

### Identity
- `transactionId` — immutable, server-generated.

### Required core fields
- `merchantId` — immutable tenant owner.
- `customerId` — immutable subject.
- `type` — at minimum `POINTS_ISSUED` or `REWARD_REDEEMED`.
- `pointsDelta` — immutable signed effect on balance.
- `balanceBefore` — immutable.
- `balanceAfter` — immutable.
- `rewardId` — nullable; required for reward redemption.
- `redemptionId` — nullable; populated for reward redemption when the relationship is created.
- `actorType` — e.g. merchant owner/system/customer where applicable to the approved flow.
- `actorId` — immutable identity of the actor.
- `createdAt` — immutable server timestamp.
- `idempotencyKey` or equivalent replay-control metadata where required by the mutation path.

### Ownership
Exactly one Merchant and one Customer.

### Relationships
- belongs to one Merchant;
- belongs to one Customer;
- may reference one Reward;
- may reference one Redemption.

### Lifecycle
Transactions are append-only.

There is no normal update/delete operation for business effects. Corrections, if ever required, must be represented by a new compensating transaction rather than rewriting historical truth.

### Immutable fields
All business-effect fields listed above.

### Mutable fields
No normal client-editable fields.

---

## 8. Entity: Redemption

### Purpose
Records the successful business redemption of a specific reward by a customer.

### Identity
- `redemptionId` — immutable, server-generated.

### Core fields
- `merchantId` — immutable owner.
- `customerId` — immutable.
- `rewardId` — immutable reference.
- `transactionId` — immutable reference to the authoritative point transaction.
- `pointsCost` — immutable snapshot of the authoritative cost used at redemption time.
- `status` — successful/voided only if a later approved compensation workflow requires it.
- `actorType`;
- `actorId`;
- `createdAt` — immutable server timestamp.
- replay/idempotency metadata as required.

### Ownership
Exactly one Merchant and one Customer.

### Relationships
- belongs to one Merchant;
- belongs to one Customer;
- references one Reward;
- references one Transaction.

### Lifecycle
Normal MVP path:
- created as a successful redemption together with the authoritative transaction.

No partial "success" state may be exposed if the point deduction/transaction creation fails.

### Immutable fields
All identity, ownership, reward, cost, actor, and creation evidence.

### Mutable fields
Only explicitly approved operational status metadata, if later required. Client-side arbitrary mutation is prohibited.

---

## 9. Entity: QR Identity / Token

### Purpose
Represents the security artifact used by the QR-assisted customer identification/redemption workflow.

### Important rule
A QR artifact is **not** itself an authorization grant.

### Core fields
Exact implementation format is deferred to Phase 4, but the domain requires support for:
- `qrTokenId` or equivalent server identity;
- `merchantId`;
- `customerId`;
- token/reference payload;
- issuance/creation timestamp;
- expiry metadata when applicable;
- revocation/status metadata;
- replay/idempotency metadata where applicable;
- server-side validation/signature evidence where applicable.

### Ownership
Bound to one Merchant and one Customer.

### Lifecycle
- issued/active;
- expired;
- revoked.

### Immutable fields
Token identity, owner references, issuance evidence.

### Controlled fields
Status/revocation/expiry according to server-side security logic.

### Security boundary
The scanner client must never be allowed to decide that possession of a QR string proves authorization. The authenticated merchant and server-side validation remain authoritative.

---

## 10. Audit metadata

Sensitive entities and mutations require server-controlled audit metadata.

Minimum common metadata:
- actor identity;
- actor type;
- merchant/tenant identity;
- server timestamp;
- operation/transaction identifier;
- idempotency/replay identifier where applicable.

Audit data must support reconstruction of:
- who performed the operation;
- for which merchant;
- against which customer/reward;
- what point effect occurred;
- when it occurred.

Client-provided timestamps are not authoritative.

---

## 11. Relationship map

Conceptual ownership graph:

```text
Merchant
 ├── LoyaltyProgram (1 active in MVP)
 │    └── Reward (many)
 │
 ├── Customer (many)
 │    ├── Transaction (many)
 │    ├── Redemption (many)
 │    └── QR Identity/Token (many over lifecycle; active artifact as required)
 │
 └── Transaction (tenant-scoped ledger)
```

Cross-entity references must preserve the merchant tenant boundary.

Critical invariants:

1. Customer.merchantId = Transaction.merchantId.
2. Reward.merchantId = Redemption.merchantId.
3. Customer.merchantId = Redemption.merchantId.
4. Transaction.customerId = Redemption.customerId when linked.
5. Transaction.rewardId = Redemption.rewardId for reward redemptions.
6. Redemption.transactionId points to the authoritative point-changing transaction.
7. Reward.pointsCost used in redemption is read from trusted persisted reward data, not from client input.
8. No entity may be accepted solely because its ID exists; ownership must also be validated.
9. Archived customer/reward records remain attributable to historical transactions.

---

## 12. Points invariants

The following are domain-level invariants for later implementation:

- points mutations are server-authoritative;
- point amounts must be valid positive integers for issuance;
- reward costs must be valid positive integers;
- a redemption cannot reduce the balance below zero;
- `balanceAfter = balanceBefore + pointsDelta`;
- reward redemption uses `pointsDelta = -pointsCost`;
- every successful point-changing operation creates its corresponding transaction evidence;
- failed operations do not produce a successful transaction/redemption;
- duplicate mutation requests must not produce duplicate business effects where an idempotency key is required;
- client state is never the source of truth.

---

## 13. Ownership and authorization matrix

| Entity | Owner | Merchant access | Customer access |
|---|---|---|---|
| Merchant | itself | own tenant only | public/minimal branded data only where explicitly exposed |
| LoyaltyProgram | Merchant | own tenant only | read active customer-facing configuration |
| Reward | Merchant/Program | own tenant only | read active rewards for their own loyalty context |
| Customer | Merchant | own customers only | own record only |
| Transaction | Merchant + Customer | own tenant only | own history only |
| Redemption | Merchant + Customer | own tenant only | own history only |
| QR Token | Merchant + Customer | own tenant / authorized redemption flow | own QR artifact only |

This is a domain ownership model, not yet a Firebase Rules implementation. Enforcement belongs to Phases 1–2 and later security work.

---

## 14. What is intentionally NOT modeled yet

To prevent premature complexity, the MVP domain does not introduce:
- staff/member roles beyond Merchant Owner;
- multiple branches/locations;
- subscription/billing entities;
- payment entities;
- marketing campaign entities;
- tier entities;
- referral entities;
- points-expiration ledgers;
- external POS integration entities;
- analytics warehouse schemas.

These can be added only when a concrete product requirement justifies them.

---

## 15. Gate 3 verification

### Contract alignment
The model covers every core MVP business object:
- Merchant;
- Customer;
- LoyaltyProgram;
- Reward;
- Transaction;
- Redemption;
- QR identity/token;
- audit metadata.

### Ownership verification
Every protected record has an explicit tenant owner or an unambiguous parent through which ownership is derived.

### Lifecycle verification
Customer, reward, merchant, program, QR artifact, redemption, and transaction lifecycles are defined sufficiently for later implementation.

### Immutability verification
Identity, ownership, timestamps, and historical transaction effects are protected from ordinary client mutation.

### Business correctness verification
Points and redemption invariants are explicitly defined, including the requirement that reward cost comes from trusted persisted domain data.

### Scope verification
The model does not introduce payment, advanced marketing, staff-role, multi-location, or other out-of-contract infrastructure.

### Gate 3 decision

**PASS / CLOSED**

The MVP contract is now translated into an implementation-ready minimal domain model.

Next authorized step:

**Phase 0 — Gate 4: Architecture Decision**
