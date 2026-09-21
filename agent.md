# LoyaltyHub — Agent Reference

> Canonical engineering reference for the LoyaltyHub project.
> Repository: https://github.com/Abdeldjalildev/Loyalty-hub
> Default branch: `main`
> Product objective: transform the current React demo into a secure, persistent, configurable, client-ready loyalty product for small businesses.

## 1. Mission

LoyaltyHub is a multi-tenant loyalty platform for cafés, restaurants, shops, salons/barbers and similar small businesses.

The final MVP must support this real flow:

New client business → merchant account → configure branding → configure loyalty rules → create rewards → add customers → customers earn points → customer sees balance → QR identity → merchant redemption → atomic transaction → analytics update → client-ready operation.

This repository must evolve from its current frontend/demo state without unnecessary rewrites.

## 2. Current Baseline

Known baseline at the start of the production roadmap:
- React + TypeScript + Vite + Tailwind.
- Current UI has Merchant Dashboard and Customer Portal/demo flows.
- App uses frontend state rather than real protected routes/auth.
- Loyalty data currently relies on React state/localStorage.
- QR generation currently exposes a raw customer identifier.
- QR scanning currently performs local lookup rather than trusted server validation.
- No production authentication, backend, database, authorization or tenant isolation exists yet.
- No production test suite/CI baseline was present at audit time.
- Firebase is the selected backend direction for the roadmap.

Important known defect:
- Existing reward redemption flow can pass a campaign/reward identifier such as `CAMP-1` into a numeric points-cost path, producing `NaN`; the UI can still show success without verifying the operation. This must be solved at the domain/backend level in Phase 4, not patched cosmetically.

## 3. Technology Direction

Target stack:
- Frontend: React, TypeScript, Vite, Tailwind.
- Backend platform: Firebase.
- Authentication: Firebase Authentication.
- Database: Cloud Firestore.
- Server-side business logic: Firebase Cloud Functions.
- Authorization/data isolation: Firestore Security Rules plus server-side authorization.
- Local backend development/testing: Firebase Emulator Suite.
- Deployment: current frontend hosting can remain Vercel; Firebase services host backend capabilities.

Firebase is infrastructure, not a substitute for application architecture. Sensitive business operations must be implemented and validated server-side.

Do not introduce Express, a custom JWT system, a custom auth server, Redis, Docker, a separate database server, or other infrastructure unless a demonstrated product requirement makes it necessary and the scope is explicitly approved.

## 4. Non-Negotiable Engineering Rules

1. Evidence first. Inspect the actual repository and current state before changing code.
2. One phase at a time. Do not silently skip gates.
3. Every phase has exactly five gates.
4. Gate dependency is strict: later gates build on earlier verified gates.
5. Do not implement future-phase work early merely because it is convenient.
6. Do not make broad refactors, dependency migrations, redesigns, random cleanup, or architecture changes without explicit scope.
7. Do not weaken tests to make them pass.
8. Do not hide errors behind success toasts, optimistic UI, ignored return values, or broad catch blocks.
9. Business-critical validation must not depend on frontend trust.
10. Never trust client-supplied points, balances, merchant IDs, customer ownership, reward costs, transaction totals, or authorization claims.
11. Sensitive mutations must be server-authoritative.
12. Multi-tenant isolation must be enforced by backend/database rules, not merely by hiding UI.
13. Never expose secrets in frontend code, source control, logs, or public configuration.
14. Prefer the smallest safe change that closes the current gate.
15. Preserve working UI/UX unless the current scope requires change.
16. Keep TypeScript strict and avoid new `any` usage.
17. Validate external/user input at trust boundaries.
18. Use stable database identifiers; do not use random short numeric customer IDs as production identity.
19. Transactions that change points must have an auditable record.
20. Monetary/payment functionality is out of scope unless separately approved.
21. QR data must not be treated as proof of authorization by itself.
22. Every security-sensitive path needs a negative/abuse test.
23. Do not add dependencies merely for convenience.
24. Do not commit generated secrets, local environment files, emulator data, or credentials.
25. Never claim a gate is complete without concrete evidence.
26. If a blocker is complex and outside the current gate, document it and stop rather than expanding scope.
27. Local/manual actions belong to the user when GitHub cannot safely perform them; provide exact instructions only when necessary.
28. Do not create commits/pushes outside the requested scope.

## 5. Definition of Done

A phase is closed only when:
- Its five gates are completed.
- Scope is explicitly recorded.
- Implementation matches the approved design.
- Verification evidence exists.
- Relevant tests/build checks pass.
- Security implications are reviewed.
- No unresolved Critical/High blocker from that phase remains.
- The next phase has a stable foundation.
- A closure report records changed files, behavior, verification, and remaining risks.

Final product readiness requires:
- real merchant authentication;
- real multi-tenant isolation;
- persistent customers/rewards/points;
- trusted server-side points operations;
- atomic reward redemption;
- secure QR workflow;
- real customer experience;
- configurable business branding/rules;
- useful merchant analytics;
- production hardening;
- client-ready demo/onboarding/deployment documentation.

## 6. Master Roadmap

### Phase 0 — Product Contract & Architecture

Goal: define the product and architecture before implementation.

#### Gate 1 — Discovery & Current-State Baseline
- Inspect repository, branch, commit, structure and runtime.
- Inventory existing screens, components, flows and data paths.
- Record deployment state and known defects.
- Confirm current limitations and production blockers.
- Produce a factual baseline; do not modify product code.

#### Gate 2 — MVP Contract
Define exactly what the first sellable MVP includes.

Merchant MVP:
- authentication;
- merchant profile;
- customer management;
- loyalty program configuration;
- reward management;
- points issuance;
- redemption;
- transaction history;
- basic analytics;
- branding/settings.

Customer MVP:
- secure identity/access model;
- loyalty balance;
- rewards;
- transaction/history view;
- loyalty card/QR;
- redemption flow as defined by the final access model.

Explicitly define out-of-scope items so scope cannot drift.

**Status: PASS / CLOSED**

Evidence: `docs/phase-0/PHASE-0-GATE-2-REPORT.md`

Key contract decisions:
- Merchant Owner is the only merchant role in MVP.
- One active loyalty program per merchant.
- Customer self-service uses Firebase Authentication email-link/passwordless access.
- Customer email is required for self-service enrollment; phone-only records may remain merchant-managed.
- Point issuance and redemption are server-authoritative.
- MVP excludes payments, advanced loyalty/marketing, staff roles, multi-location, native apps, POS integrations, and advanced BI.

#### Gate 3 — Domain Model
Define entities and relationships:
- Merchant
- Customer
- LoyaltyProgram
- Reward
- Transaction
- Redemption
- QR identity/token
- required audit metadata

Define ownership, lifecycle, immutable fields, mutable fields and relationships.

**Status: PASS / CLOSED**

Evidence: `docs/phase-0/PHASE-0-GATE-3-REPORT.md`

Key domain decisions:
- Merchant is the tenant root.
- Customer, Reward, Transaction and Redemption are tenant-bound.
- Transaction is append-only authoritative loyalty ledger evidence.
- Redemption references its authoritative transaction and snapshots the trusted reward cost used.
- Customer balance is server-controlled and never client-authoritative.
- QR artifacts are security artifacts, not authorization grants.
- Sensitive operations require server-controlled actor, tenant, timestamp and replay/idempotency metadata where applicable.

#### Gate 4 — Architecture Decision
**Status: PASS / CLOSED**

Evidence: `docs/phase-0/PHASE-0-GATE-4-REPORT.md`

Finalize:
- Firebase Authentication;
- Firestore structure;
- Cloud Functions responsibilities;
- Security Rules boundaries;
- tenant isolation;
- trusted points operations;
- QR architecture;
- environments;
- emulator strategy;
- public vs secret configuration.

Firebase is selected as the backend platform; implementation starts in Phase 1.

#### Gate 5 — Closure
**Status: PASS / CLOSED**

Evidence: `docs/phase-0/PHASE-0-GATE-5-REPORT.md`

Verify the product contract, domain model, architecture and security boundaries.
Output: LoyaltyHub Product Blueprint.

**Phase 0: PASS / CLOSED**

No production backend implementation before Phase 0 closure.

---

### Phase 1 — Production Foundation

Goal: introduce the production-capable backend foundation.

**Status: PASS / CLOSED**

Evidence:
- `docs/phase-1/PHASE-1-GATE-1-REPORT.md`
- `docs/phase-1/PHASE-1-GATE-2-REPORT.md`
- `docs/phase-1/PHASE-1-GATE-3-REPORT.md`
- `docs/phase-1/PHASE-1-GATE-4-REPORT.md`
- `docs/phase-1/PHASE-1-GATE-5-REPORT.md`


#### Gate 1 — Foundation Baseline
**Status: PASS / CLOSED**

- Verify build, TypeScript, Vite and dependency baseline.
- Define clean backend/frontend boundaries.
- Avoid unrelated refactors.

#### Gate 2 — Environment Architecture
**Status: PASS / CLOSED**

Define development/preview/production environments.
Separate public Firebase configuration from secrets.
Define safe environment variable handling.

#### Gate 3 — Firebase Foundation
**Status: PASS / CLOSED**

Introduce Firebase infrastructure:
- Firebase project/environment setup;
- Authentication foundation;
- Firestore foundation;
- Cloud Functions foundation;
- Emulator Suite configuration;
- minimal integration wiring.

Do not implement the full loyalty domain yet.

#### Gate 4 — Security Foundation
**Status: PASS / CLOSED**

Establish:
- authenticated vs unauthenticated boundaries;
- baseline Firestore Rules;
- server-only operations;
- secret handling;
- least-privilege defaults;
- safe function invocation boundaries.

#### Gate 5 — Closure
**Status: PASS / CLOSED**

Verify build, deployment compatibility, Firebase connectivity, emulator behavior and security baseline.
Phase 1 must leave a stable backend foundation for identity work.

---

### Phase 2 — Identity & Multi-Tenant Architecture

Goal: real merchant identity and tenant isolation.

#### Gate 1 — Merchant Identity
Implement:
- registration/login;
- logout;
- session handling;
- merchant profile foundation.

#### Gate 2 — Tenant Model
Establish ownership:
Merchant A → only A's customers/rewards/transactions.
Merchant B → only B's customers/rewards/transactions.

#### Gate 3 — Authorization
Enforce authorization in backend/database boundaries, not only in UI.
Validate merchant ownership on every sensitive operation.

#### Gate 4 — Isolation Verification
Test:
- reads;
- writes;
- updates;
- deletes;
- direct access attempts;
- unauthorized function calls;
- cross-merchant IDs.

#### Gate 5 — Closure
Prove that two merchants can operate independently and cannot access each other's protected data.

---

### Phase 3 — Persistent Loyalty Core

Goal: replace demo/local state with persistent production data.

#### Gate 1 — Customer Persistence
Implement:
- customer CRUD;
- archive/deactivation model;
- merchant ownership;
- normalization and validation;
- production-safe customer identifiers.

#### Gate 2 — Loyalty Program & Rewards
Implement persisted:
- loyalty rules;
- rewards;
- reward costs;
- availability/status;
- merchant ownership.

Remove hardcoded production assumptions.

#### Gate 3 — Points Engine
Implement trusted business logic:
- valid point amounts;
- no NaN/negative/invalid mutations;
- authorization;
- balance calculation;
- consistent persistence.

#### Gate 4 — Persistence Verification
Verify:
create → refresh → logout → login → data remains.
Also verify across sessions/devices and against cross-tenant access.

#### Gate 5 — Closure
Real merchants, customers, rewards and points persist correctly.

---

### Phase 4 — Secure Transactions & QR

Goal: trustworthy loyalty transactions.

#### Gate 1 — Transaction Model
Define persistent transaction records including, as appropriate:
- transactionId;
- merchantId;
- customerId;
- type;
- points;
- balanceBefore;
- balanceAfter;
- rewardId/redemption reference;
- actor;
- timestamp;
- idempotency/replay metadata where required.

#### Gate 2 — Atomic Redemption
Implement server-authoritative flow:
validate → authorize → verify customer/reward ownership → check balance → deduct → create redemption/transaction atomically.

No partial success.

#### Gate 3 — Existing Redemption Defect Closure
Eliminate the current campaign-ID/numeric-cost mismatch at domain level.
The operation must use the actual reward identity and trusted persisted points cost.
The UI may report success only after a verified successful backend result.

#### Gate 4 — Secure QR
Design and implement a secure QR mechanism.
Test:
- forged data;
- tampered data;
- expired data where applicable;
- wrong merchant;
- unknown customer;
- duplicate/replay;
- unauthorized scanner.

A raw customer ID is not sufficient proof of authorization.

#### Gate 5 — Closure
All point changes and redemptions are trusted, atomic, persistent and auditable.

---

### Phase 5 — Real Customer Experience

Goal: replace the current simulator with a real customer experience.

#### Gate 1 — Customer Identity
Choose and implement the MVP customer access model based on the Phase 0 contract.
Examples may include account, magic link, phone-based access or controlled onboarding; do not add complexity without need.

#### Gate 2 — Customer Portal
Customer can securely view:
- own balance;
- rewards;
- transactions;
- loyalty card/QR;
- relevant loyalty information.

#### Gate 3 — Customer Isolation
Prove customer A cannot access customer B's information through:
- URL manipulation;
- state manipulation;
- altered identifiers;
- direct requests.

#### Gate 4 — Customer Redemption E2E
Verify the full customer/business transaction path:
customer identity → reward → authorization → redemption → points deduction → transaction record → updated balance.

#### Gate 5 — Closure
Customer experience is real, persistent and isolated; no simulator dependency remains for production flows.

---

### Phase 6 — Merchant Productization

Goal: configure new businesses without source-code edits.

#### Gate 1 — Business Profile
Support:
- business name;
- logo;
- description;
- contact details;
- social/contact links as required.

#### Gate 2 — Branding
Support configuration-driven:
- logo;
- colors;
- theme;
- brand identity.

#### Gate 3 — Loyalty Configuration
Support merchant-configurable:
- points rules;
- rewards;
- thresholds;
- relevant loyalty behavior.

#### Gate 4 — Configuration Isolation
Prove Merchant A's branding/configuration cannot affect Merchant B.

#### Gate 5 — Closure
A new client can be configured through product data/settings rather than source modifications.

---

### Phase 7 — Commercial UX & Analytics

**Status: PASS / CLOSED**

- Gate 1–5: PASS / CLOSED
- Branch CI Run #79: SUCCESS
- PR #6 merged to main
- Post-merge main CI Run #83: SUCCESS

### Phase 8 — Production Hardening

**Status: PASS / CLOSED**

- Gate 1–5: PASS / CLOSED
- Branch CI Run #86: SUCCESS
- PR #7 merged to main
- Main post-merge CI Run #87: SUCCESS
- Final documentation CI Run #94: SUCCESS

### Phase 9 — Client-Ready Product

**Status: IMPLEMENTED / PENDING CI**

Goal: turn the hardened product into a repeatable client onboarding, demo, deployment and handoff package.

#### Gate 1 — Demo Tenant
- deterministic demo tenant seed;
- authenticated merchant demo account created from supplied environment credentials;
- sample customer, rewards, branding and loyalty rules;
- no credentials committed to source control.

#### Gate 2 — Client Onboarding
- in-product onboarding checklist;
- business profile, branding, loyalty rules, rewards and customer readiness checks;
- direct link to Business Settings.

#### Gate 3 — Deployment & Handoff
- documented Firebase + Vercel deployment contract;
- environment/secret handling;
- deployment and handoff checklist.

#### Gate 4 — Sales Demo Validation
- documented end-to-end sales demonstration flow;
- automated validation of demo data;
- relies on existing transaction, customer and hardening suites for security-critical flow coverage.

#### Gate 5 — Closure
- CI, merge and post-merge verification;
- closure evidence recorded in agent.md.

**Phase 9 is not closed until all evidence is present.**

---

### Phase 10
Not part of the approved 10-phase roadmap. Do not start additional implementation after Phase 9 without explicit scope approval.
