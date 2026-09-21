# Phase 4 — Gate 2: Atomic Redemption

**Status: PASS / CLOSED**

Reward redemption is performed in one Firestore transaction.

The transaction reads the idempotency record, QR token, reward and customer before writing. On success it atomically:
1. decrements the customer balance;
2. consumes the QR token;
3. creates the redemption record;
4. creates the negative redemption transaction.

Insufficient balance, inactive/missing customer, inactive/missing reward, expired QR, reused QR, and invalid reward costs are rejected without a partial redemption.

Evidence: Phase 4 PR GitHub Actions run #43 (`35641378014`) passed frontend and Firebase foundation; Firebase emulator tests: 12/12 passed. Main verification run #44 (`35641526182`) also passed frontend and Firebase foundation.