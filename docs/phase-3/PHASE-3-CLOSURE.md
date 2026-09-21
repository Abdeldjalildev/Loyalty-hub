# Phase 3 — Persistent Loyalty Core

## Current status

**PASS / CLOSED**

### Gate status
- Gate 1 — Customer Persistence: PASS / CLOSED
- Gate 2 — Loyalty Program & Rewards: PASS / CLOSED
- Gate 3 — Points Engine: PASS / CLOSED
- Gate 4 — Persistence Verification: PASS / CLOSED
- Gate 5 — Closure: PASS / CLOSED

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
Evidence: PR run #36 (`35638940069`) passed both frontend and firebase-foundation; main run #37 (`35639082106`) also passed after merge.
