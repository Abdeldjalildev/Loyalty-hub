# Phase 6 — Gate 1: Business Profile

**Status: PASS / CLOSED**

Business profile is now merchant-owned and server-authoritative.

Delivered:
- business name and description;
- phone and website;
- social/contact URLs;
- logo URL;
- callable update path guarded by the authenticated merchant tenant;
- validation for bounded text and HTTP(S) URLs.

The merchant document remains the tenant source of truth; no client-side profile data is authoritative.


## Final verification

GitHub Actions branch run #67 (`35644827997`) passed `frontend` and `firebase-foundation`; Firebase test suite: 20/20 passed. PR #5 was merged to `main` with merge commit `253d4416fa1bfa5add22c645ef8c69e712365c13`. Post-merge main run #68 (`35644995825`) passed `frontend` and `firebase-foundation`.
