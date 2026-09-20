# Phase 1 — Gate 4 Closure Report
## Security Foundation

**Status: PASS / CLOSED**

### Security controls established
1. Firestore is deny-by-default.
2. Protected merchant, merchant-user and customer-user paths cannot be directly written by clients.
3. Cloud Functions are the designated server boundary for sensitive mutations.
4. Public VITE configuration is separated from secrets.
5. Functions local secret files are ignored.
6. No service-account credentials or private keys are committed.
7. Emulator-based verification is defined in CI.
8. Phase 1 does not grant premature domain access before Phase 2 authorization is implemented.

### Security scope
This is a foundation, not the final authorization model. Phase 2 will replace blanket denial with authenticated tenant/customer rules and prove isolation.

### Evidence
- firestore.rules
- docs/phase-1/SECURITY-FOUNDATION.md
- functions/index.js
- functions/.gitignore
- .env.example

**Gate decision: PASS / CLOSED**
