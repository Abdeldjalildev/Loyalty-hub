# Phase 9 — Gate 3: Deployment & Handoff

## Status
PASS / CLOSED

## Handoff contract
1. Firebase project: `loyal-hub-project`
2. Frontend host: Vercel
3. Build command: `npm run build`
4. Preview command: `npm run preview`
5. Backend runtime: Firebase Functions Node 20
6. Firestore rules/indexes are versioned in the repository.
7. Customer SPA routes are covered by `vercel.json`.
8. Production security headers are defined in `vercel.json`.
9. No secret values belong in Git; Firebase/Vercel environment configuration must be supplied through the platform.

## Client handoff checklist
- Create/verify production Firebase project.
- Configure frontend Firebase public configuration in the hosting environment.
- Deploy Firestore rules and indexes.
- Deploy Functions.
- Deploy frontend.
- Create a merchant account through the normal signup flow.
- Complete the onboarding checklist.
- Validate customer portal and QR redemption before handoff.

No credentials are committed by this phase.
