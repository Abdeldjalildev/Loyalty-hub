# Phase 3 — Gate 4: Persistence Verification

**Status: IMPLEMENTED / PENDING FINAL CI**

Verification coverage includes customer creation, Firestore reload after mutation, points issuance and stored balance, customer archival, and loyalty program/reward persistence across repeated reads.

Direct client reads/writes to merchant loyalty data are denied by Firestore Rules; sensitive operations use authenticated callable functions.

Final PASS requires green CI evidence.