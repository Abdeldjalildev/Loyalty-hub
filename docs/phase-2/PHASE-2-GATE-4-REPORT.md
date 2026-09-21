# Phase 2 — Gate 4: Isolation Verification

**Status: PASS / CLOSED**

The emulator test creates two authenticated merchant identities and two tenant mappings. It verifies:
- Merchant A can read its own root;
- Merchant A can read its own nested document;
- Merchant A cannot read Merchant B;
- Merchant A cannot read Merchant B nested documents;
- Merchant A cannot write inside Merchant B.

These are direct backend negative tests, not UI-only checks.
