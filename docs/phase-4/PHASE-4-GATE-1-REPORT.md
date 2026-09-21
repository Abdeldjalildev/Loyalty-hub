# Phase 4 — Gate 1: Transaction Model

**Status: PASS / CLOSED**

Phase 4 introduces the append-only loyalty transaction ledger under each merchant tenant.

Earn transactions record:
- merchantId;
- customerId;
- positive points delta;
- balanceBefore / balanceAfter;
- actor UID;
- idempotency key when supplied;
- server timestamp.

Redeem transactions record:
- merchantId;
- customerId;
- negative points delta;
- reward ID;
- redemption ID;
- trusted reward cost snapshot;
- balanceBefore / balanceAfter;
- actor UID;
- QR token reference;
- idempotency key;
- server timestamp.

Client direct Firestore access remains denied; ledger writes occur only through server-authoritative callable functions.

Evidence: Phase 4 PR GitHub Actions run #43 (`35641378014`) passed frontend and Firebase foundation; Firebase emulator tests: 12/12 passed. Main verification run #44 (`35641526182`) also passed frontend and Firebase foundation.