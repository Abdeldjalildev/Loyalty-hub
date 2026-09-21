# Phase 3 — Gate 2: Loyalty Program & Rewards

**Status: PASS / CLOSED**

Each merchant receives one persisted active default loyalty program and persisted rewards. Rewards store multilingual titles, trusted point cost, merchant ownership and status.

The default catalog is created idempotently by the server and loaded from Firestore; the frontend no longer treats hardcoded rewards as the source of truth.

Evidence: GitHub Actions PR run #36 passed.