# LoyaltyHub Phase 1 — Environment Architecture

## Environments

### Development
- Local Vite frontend.
- Firebase Emulator Suite for Auth, Firestore and Functions.
- Development-only data.
- No production credentials or customer data.

### Preview / Staging
- Isolated Firebase project/environment.
- Vercel preview deployment.
- Test/demo data only.

### Production
- Dedicated Firebase project.
- Production Auth, Firestore and Functions.
- Vercel production frontend.

## Configuration boundary

Public Firebase web configuration may be supplied to the browser through VITE_FIREBASE_* variables.

Secrets, service-account credentials and private keys must never be placed in VITE_* variables or committed.

Server secrets belong to Firebase-supported secret/configuration mechanisms.

## Local files

.env.local and other local environment files are ignored by the repository.

## Promotion rule

Development → preview/staging → production.

Production data is never used as a development fixture.
