# Phase 6 — Gate 1: Business Profile

**Status: IMPLEMENTED / PENDING CI**

Business profile is now merchant-owned and server-authoritative.

Delivered:
- business name and description;
- phone and website;
- social/contact URLs;
- logo URL;
- callable update path guarded by the authenticated merchant tenant;
- validation for bounded text and HTTP(S) URLs.

The merchant document remains the tenant source of truth; no client-side profile data is authoritative.
