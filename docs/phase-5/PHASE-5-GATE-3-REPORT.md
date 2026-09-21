# Phase 5 — Gate 3: Customer Isolation

**Status: PASS / CLOSED**

Customer access is server-authoritative:
- `customerUsers/{authUid}` is not client-writable/readable;
- customer callables derive tenant/customer identity from the authenticated UID;
- the client cannot select another customer ID for portal data;
- cross-tenant customer mappings are rejected;
- merchant Firestore data remains directly denied by Security Rules.

No customer-owned Firestore reads are required for the portal.