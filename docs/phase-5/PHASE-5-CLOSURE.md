Phase 5 is PASS / CLOSED.

## Final CI evidence

- PR #4: `Phase 5: customer identity and portal`
- GitHub Actions run #56 (`35643260599`): **PASS**
- `frontend`: **success**
- `firebase-foundation`: **success**
- PR #4 merged to `main` with merge commit `6d02808ed77962826f2fa6e3e14da952c578c013`.

## Scope delivered

- Separate Firebase customer authentication session.
- Customer account provisioning against an existing merchant customer record.
- Server-authoritative `customerUsers` tenant mapping.
- Dedicated `/customer` authenticated portal.
- Customer balance, reward eligibility and recent activity.
- Customer-owned secure QR issuance.
- Full merchant-scan/customer-redemption flow.
- Cross-tenant identity isolation.
- Vercel SPA rewrite for `/customer`.

## Explicitly deferred

- Merchant invitation automation.
- Customer email-link/passwordless activation.
- Staff roles.
- Advanced customer profile/marketing features.
- Production deployment hardening.

Phase 5 is closed. The next authorized step is Phase 6 — Gate 1: Business Profile.
