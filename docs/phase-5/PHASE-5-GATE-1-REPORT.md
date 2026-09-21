# Phase 5 — Gate 1: Customer Identity

**Status: IMPLEMENTED / PENDING CI**

Customer identity is separated from merchant identity using Firebase Auth plus a server-authoritative `customerUsers/{authUid}` mapping.

A customer account is provisioned only when the authenticated email matches one active customer record inside the explicitly selected merchant tenant. The mapping is immutable across tenants and direct Firestore access remains denied.

Customer sessions use a separate localStorage key and refresh path from merchant sessions.