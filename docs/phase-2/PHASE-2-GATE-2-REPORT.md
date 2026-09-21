# Phase 2 — Gate 2: Tenant Model

**Status: PASS / CLOSED**

The tenant model is:
- `merchantUsers/{authUid}` → one `merchantId`;
- `merchants/{merchantId}` → merchant tenant root;
- future merchant data under `merchants/{merchantId}/...`;
- Merchant Owner is the only MVP role.

Provisioning is idempotent for an authenticated UID and derives identity from verified Auth context.
