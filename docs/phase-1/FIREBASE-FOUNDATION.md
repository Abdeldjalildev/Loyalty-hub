# Firebase Foundation

Phase 1 establishes the Firebase boundary without implementing the full loyalty domain.

## Components

- Firebase Authentication: identity foundation.
- Cloud Firestore: persistent source-of-truth foundation.
- Cloud Functions v2: trusted server execution boundary.
- Firestore Security Rules: default-deny database boundary.
- Emulator Suite: deterministic local backend environment.

## Logical collections

- /merchants/{merchantId}
- /merchantUsers/{authUid}
- /customerUsers/{authUid}
- merchant subcollections are defined by the Phase 0 domain/architecture reports.

## Deferred to later phases

- merchant identity onboarding: Phase 2
- tenant authorization model: Phase 2
- persistent loyalty domain: Phase 3
- transactions/redemption/QR: Phase 4

Phase 1 must not bypass those dependencies.
