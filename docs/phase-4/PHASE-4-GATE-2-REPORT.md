# Phase 4 — Gate 2: Atomic Redemption

**Status: IMPLEMENTED / PENDING FINAL CI**

Reward redemption is performed in one Firestore transaction.

The transaction reads the idempotency record, QR token, reward and customer before writing. On success it atomically:
1. decrements the customer balance;
2. consumes the QR token;
3. creates the redemption record;
4. creates the negative redemption transaction.

Insufficient balance, inactive/missing customer, inactive/missing reward, expired QR, reused QR, and invalid reward costs are rejected without a partial redemption.

Final PASS requires green CI evidence.