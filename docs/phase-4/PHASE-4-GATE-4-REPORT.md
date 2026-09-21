# Phase 4 — Gate 4: Secure QR

**Status: IMPLEMENTED / PENDING FINAL CI**

Customer QR artifacts now use opaque random tokens instead of raw customer IDs.

Design:
- 256-bit random token;
- SHA-256 hash stored as the Firestore QR document ID;
- raw token never persisted;
- five-minute expiry;
- merchant tenant binding;
- customer binding;
- single-use consumption;
- actor UID recorded on issuance and consumption;
- payload prefix `LHY2:` prevents accidental acceptance of legacy raw customer IDs.

A replayed or expired QR cannot authorize another redemption.

Final PASS requires green CI evidence.