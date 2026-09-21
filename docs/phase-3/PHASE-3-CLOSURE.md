# Phase 3 — Persistent Loyalty Core

## Current status

**IMPLEMENTED / PENDING FINAL CI**

### Gate status
- Gate 1 — Customer Persistence: IMPLEMENTED / PENDING FINAL CI
- Gate 2 — Loyalty Program & Rewards: IMPLEMENTED / PENDING FINAL CI
- Gate 3 — Points Engine: IMPLEMENTED / PENDING FINAL CI
- Gate 4 — Persistence Verification: IMPLEMENTED / PENDING FINAL CI
- Gate 5 — Closure: IMPLEMENTED / PENDING FINAL CI

### Scope delivered
- Firestore-backed customers under each merchant tenant.
- Active/archive customer lifecycle.
- Persisted default loyalty program.
- Persisted rewards with trusted point costs.
- Server-authoritative point issuance with transactional balance updates.
- Direct client reads/writes to merchant loyalty data disabled.
- Emulator-backed function tests for validation and persistence.

### Explicitly deferred
- Transaction ledger.
- Atomic reward redemption.
- Secure QR authorization.
- Real customer identity/portal.
- Merchant configuration and analytics.

Those remain in later roadmap phases.

### Security
Sensitive loyalty mutations run through authenticated callable functions and Admin SDK server logic. Firestore direct client access to merchant data is denied.

### Evidence
Final GitHub Actions verification is required before merge to `main` and PASS / CLOSED status.
