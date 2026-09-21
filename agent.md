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

Goal: make the system usable and commercially presentable.

#### Gate 1 — Merchant UX
Refine:
- navigation;
- onboarding;
- dashboard;
- customers;
- rewards;
- transactions;
- settings.

#### Gate 2 — States & Error Handling
Implement meaningful:
- loading;
- empty;
- success;
- error;
- retry;
- confirmation;
- disabled/in-progress states.

Never report success before backend confirmation.

#### Gate 3 — Analytics
Provide useful metrics such as:
- total customers;
- active customers;
- points issued;
- points redeemed;
- redemption rate;
- popular rewards;
- customer growth.

Metrics must come from persistent trusted data.

#### Gate 4 — Responsive & Accessibility
Verify:
- desktop;
- tablet;
- mobile;
- RTL;
- keyboard;
- touch;
- readable errors;
- accessible controls.

#### Gate 5 — Closure
Merchant can understand and operate the core product without developer intervention.

---

### Phase 8 — Production Hardening

Goal: prove trustworthiness under realistic misuse and failure.

#### Gate 1 — Security Audit
Review:
- auth;
- authorization;
- Rules;
- Functions;
- secrets;
- tenant isolation;
- QR;
- points manipulation;
- exposed identifiers;
- unsafe client assumptions.

#### Gate 2 — Business Logic Testing
Test:
- normal points;
- invalid points;
- insufficient balance;
- invalid reward;
- invalid customer;
- unauthorized merchant;
- duplicate operations;
- redemption edge cases.

#### Gate 3 — Failure & Abuse Testing
Test:
- modified requests;
- direct database access attempts;
- replay;
- malformed data;
- unauthorized IDs;
- duplicate submissions;
- stale state;
- concurrent operations where relevant.

#### Gate 4 — Production Build & Deployment
Verify:
- production build;
- environment configuration;
- deployment;
- runtime errors;
- Firebase connectivity;
- Functions;
- database;
- auth.

#### Gate 5 — Closure
No unresolved Critical/High production blocker.

---

### Phase 9 — Client-Ready Product

Goal: package LoyaltyHub for real sales and delivery.

#### Gate 1 — Demo Tenant
Create a realistic demo business with:
- branding;
- customers;
- rewards;
- transactions;
- points;
- QR;
- analytics.

#### Gate 2 — Client Onboarding
Validate:
new client → merchant account → branding → loyalty rules → rewards → customers → go-live.

#### Gate 3 — Deployment & Handoff
Document:
- deployment;
- configuration;
- onboarding;
- admin responsibilities;
- backup/recovery considerations;
- operational ownership.

#### Gate 4 — Sales Demo Validation
Run the full demo without developer intervention.

#### Gate 5 — Final Product Release
Final MVP is:
- functional;
- secure;
- persistent;
- tenant-isolated;
- configurable;
- client-demo quality;
- documented;
- ready for real client onboarding.

## 7. Phase/Gate Operating Protocol

For every gate:

1. Inspect current state.
2. State exact scope.
3. Identify dependencies.
4. Implement only approved scope.
5. Verify with deterministic evidence.
6. Record changed files.
7. Record tests/build results.
8. Record security implications.
9. Record remaining issues.
10. Decide PASS or FAIL.
11. Do not silently continue if a gate fails.

For every phase closure report include:
- Phase status;
- Gate 1–5 status;
- exact changes;
- files changed;
- tests executed;
- test results;
- build result;
- deployment/runtime result when relevant;
- security verification;
- known limitations;
- next-phase prerequisites.

## 8. Scope Discipline

Priority order:
1. Security and tenant isolation.
2. Correctness of points and transactions.
3. Persistent data integrity.
4. Authentication/authorization.
5. Core customer/merchant workflows.
6. Production reliability.
7. Commercial UX.
8. Decorative improvements.

Do not prioritize visual polish over business correctness.

If a requested change belongs to a later phase, document it rather than implementing it early unless explicitly approved as a dependency.

## 9. Firebase-Specific Rules

- Firebase is introduced during Phase 1.
- Phase 0 defines Firebase architecture but does not require production Firebase integration.
- Firestore is the persistent source of truth after migration.
- localStorage may remain only for non-sensitive UI preferences where appropriate.
- Never store authoritative loyalty balances only in the client.
- Never trust client-provided merchant ownership.
- Never trust client-provided reward cost.
- Use Cloud Functions for sensitive point mutations/redemptions.
- Use Security Rules to enforce direct data access boundaries.
- Use Emulator Suite for deterministic backend testing before production verification.
- Keep environments and configuration explicit.
- Keep secrets out of client bundles and Git history.

## 10. Current Work Position

Current status:
- Phase 0 — Gate 1: **PASS / CLOSED**.
- Phase 0 — Gate 2: **PASS / CLOSED**.
- Phase 0 — Gate 3: **PASS / CLOSED**.
- Phase 0 — Gate 4: **PASS / CLOSED**.
- Phase 0 — Gate 5: **PASS / CLOSED**.
- Phase 0: **PASS / CLOSED**.
- Phase 1 — Gate 1: **PASS / CLOSED**.
- Phase 1 — Gate 2: **PASS / CLOSED**.
- Phase 1 — Gate 3: **PASS / CLOSED**.
- Phase 1 — Gate 4: **PASS / CLOSED**.
- Phase 1 — Gate 5: **PASS / CLOSED**.
- Phase 1: **PASS / CLOSED**.
- Phase 2 — Gate 1: **PASS / CLOSED**.
- Phase 2 — Gate 2: **PASS / CLOSED**.
- Phase 2 — Gate 3: **PASS / CLOSED**.
- Phase 2 — Gate 4: **PASS / CLOSED**.
- Phase 2 — Gate 5: **PASS / CLOSED**.
- Phase 2: **PASS / CLOSED**.
- Phase 2 final CI evidence: GitHub Actions run #30 (`35637637018`) — frontend and Firebase foundation both succeeded; emulator tests: 3/3 passed, including cross-merchant isolation.
- Gate 1 baseline report: `docs/phase-0/PHASE-0-GATE-1-REPORT.md`.
- Gate 2 contract report: `docs/phase-0/PHASE-0-GATE-2-REPORT.md`.
- Gate 3 domain report: `docs/phase-0/PHASE-0-GATE-3-REPORT.md`.
- Gate 4 architecture report: `docs/phase-0/PHASE-0-GATE-4-REPORT.md`.
- Gate 5 closure report: `docs/phase-0/PHASE-0-GATE-5-REPORT.md`.
- Phase 1 Gate 1 report: `docs/phase-1/PHASE-1-GATE-1-REPORT.md`.
- Phase 1 Gate 2 report: `docs/phase-1/PHASE-1-GATE-2-REPORT.md`.
- Phase 1 Gate 3 report: `docs/phase-1/PHASE-1-GATE-3-REPORT.md`.
- Phase 1 Gate 4 report: `docs/phase-1/PHASE-1-GATE-4-REPORT.md`.
- Phase 1 Gate 5 report: `docs/phase-1/PHASE-1-GATE-5-REPORT.md`.
- Phase 2 Gate 1 report: `docs/phase-2/PHASE-2-GATE-1-REPORT.md`.
- Phase 2 Gate 2 report: `docs/phase-2/PHASE-2-GATE-2-REPORT.md`.
- Phase 2 Gate 3 report: `docs/phase-2/PHASE-2-GATE-3-REPORT.md`.
- Phase 2 Gate 4 report: `docs/phase-2/PHASE-2-GATE-4-REPORT.md`.
- Phase 2 Gate 5 report: `docs/phase-2/PHASE-2-GATE-5-REPORT.md`.
- The historical Phase 2/Phase 1 notes above are preserved as historical records; current Phase status is maintained in this section.
- Phase 0 is fully closed.
- Phase 1 is fully closed.
- Phase 3 — Gate 1: **PASS / CLOSED**.
- Phase 3 — Gate 2: **PASS / CLOSED**.
- Phase 3 — Gate 3: **PASS / CLOSED**.
- Phase 3 — Gate 4: **PASS / CLOSED**.
- Phase 3 — Gate 5: **PASS / CLOSED**.
- Phase 3: **PASS / CLOSED**.
- Phase 3 final verification: PR run #36 (`35638940069`) and main run #38 (`35639275561`) passed.
- Phase 4 — Gate 1: **PASS / CLOSED**.
- Phase 4 — Gate 2: **PASS / CLOSED**.
- Phase 4 — Gate 3: **PASS / CLOSED**.
- Phase 4 — Gate 4: **PASS / CLOSED**.
- Phase 4 — Gate 5: **PASS / CLOSED**.
- Phase 4: **PASS / CLOSED**.
- Phase 4 PR verification: GitHub Actions run #43 (`35641378014`) passed frontend and Firebase foundation; emulator tests: 12/12 passed.
- Phase 4 main verification: GitHub Actions run #44 (`35641526182`) passed frontend and Firebase foundation after merge.
- The next authorized step is Phase 5 — Gate 1: Customer Identity.
- Phase 1 CI/runtime evidence is confirmed by GitHub Actions run #26 (`35636482998`): frontend and firebase-foundation both succeeded.
- The selected Firebase project for the implementation is `loyal-hub-project`; Phase 2 must explicitly verify and wire the repository to this project through safe environment/deployment configuration without committing secrets.
- No production business logic should be invented from memory; inspect the current repository before each implementation step.

## 11. Change-Control Rule

This file is the long-lived project reference, not permission to implement every item immediately.

When the project evolves:
- update this document when the approved architecture, scope, phase status, or non-negotiable engineering rules materially change;
- preserve historical decisions in phase closure reports;
- do not rewrite history to make an old state appear different;
- any change to the master roadmap must be explicit and evidence-based.

## 12. Golden Rule

Build LoyaltyHub as a small, understandable, secure product — not as a giant infrastructure project.

Prefer:
**simple + persistent + server-authoritative + tenant-isolated + testable + sellable**

over:
**complex + over-engineered + premature + difficult to operate**.
