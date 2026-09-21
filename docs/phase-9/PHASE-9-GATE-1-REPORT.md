# Phase 9 — Gate 1: Demo Tenant

## Status
IMPLEMENTED / PENDING CI

## Scope
A deterministic, repeatable demo tenant seed was added for client presentations.

## Evidence
- `functions/demo-seed.js`
- Demo merchant ID: `demo-merchant`
- Demo customer ID: `demo-customer-001`
- Three demo rewards
- Demo branding and loyalty configuration
- Seed is explicit and repeatable; it is not automatically executed in production.

## Safety
No credentials or secrets are stored in the repository. The seed must only be executed against the intended Firebase project.\n\nRequired environment variables for an authenticated demo account:\n- `DEMO_MERCHANT_EMAIL`\n- `DEMO_MERCHANT_PASSWORD`\n\nRun from `functions/` with `npm run seed:demo`. The password is supplied at execution time and is never stored in Git.
