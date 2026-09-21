# Phase 4 — Gate 4: Secure QR

**Status: PASS / CLOSED**

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

Evidence: Phase 4 PR GitHub Actions run #43 (`35641378014`) passed frontend and Firebase foundation; Firebase emulator tests: 12/12 passed. Main verification run #44 (`35641526182`) also passed frontend and Firebase foundation.