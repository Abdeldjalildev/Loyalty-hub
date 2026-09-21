# Phase 4 — Gate 3: Domain Redemption Defect Closure

**Status: PASS / CLOSED**

The previous redemption path treated campaign identifiers as numeric values. That domain mismatch is removed.

Rewards now use their Firestore document IDs as opaque string identifiers. Redemption never converts reward IDs with Number(). The trusted reward cost is read from the merchant-owned reward document on the server and snapshotted into the redemption and transaction records.

Idempotency keys are also bound to their original operation to prevent accidental reuse across different customers, rewards or point amounts.

Evidence: Phase 4 PR GitHub Actions run #43 (`35641378014`) passed frontend and Firebase foundation; Firebase emulator tests: 12/12 passed. Main verification run #44 (`35641526182`) also passed frontend and Firebase foundation.