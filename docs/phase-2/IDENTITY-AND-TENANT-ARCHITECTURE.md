# Phase 2 — Identity & Multi-Tenant Architecture

## Identity
Firebase Authentication is the source of merchant identity. The MVP uses email/password authentication for merchant accounts. Firebase ID tokens are the authenticated credential presented to callable Functions and Firestore.

## Tenant mapping
`merchantUsers/{authUid}` is authoritative for the mapping:
`authUid -> merchantId`.

## Tenant root
`merchants/{merchantId}` is the tenant root and owns all future merchant-scoped collections.

## Authorization
Firestore Rules resolve the authenticated UID through `merchantUsers` and compare the resulting tenant ID with the requested merchant path. Client writes to identity mappings and merchant roots are denied; provisioning is server-authoritative.

## Firebase binding
The repository is pinned to `loyal-hub-project` through `.firebaserc`. Public web configuration is supplied through Vite environment variables; no private credential is committed.

## Phase boundary
Phase 2 intentionally does not implement customers, loyalty programs, rewards, points mutations, transactions, redemptions, or QR authorization.
