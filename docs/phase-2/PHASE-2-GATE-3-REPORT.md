# Phase 2 — Gate 3: Authorization

**Status: PASS / CLOSED**

Firestore Rules derive ownership from `merchantUsers/{request.auth.uid}`. Direct client writes to the identity mapping and merchant root are denied. Merchant subcollections are readable/writable only when the authenticated user resolves to the requested merchant tenant.

Callable Functions require verified Firebase Auth context before tenant operations.
