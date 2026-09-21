# Phase 4 — Gate 1: Transaction Model

**Status: IMPLEMENTED / PENDING FINAL CI**

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

Final PASS requires green CI evidence.