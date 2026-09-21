# Phase 5 — Gate 4: Customer Redemption E2E

**Status: IMPLEMENTED / PENDING CI**

The complete customer redemption path is wired:
1. authenticated customer signs in;
2. customer portal obtains an opaque single-use QR;
3. merchant scans the QR;
4. merchant selects a reward;
5. Phase 4 server-authoritative atomic redemption consumes the QR;
6. customer balance and immutable transaction ledger are updated.

The Phase 4 QR security and atomicity guarantees remain authoritative; Phase 5 adds the real customer identity boundary.