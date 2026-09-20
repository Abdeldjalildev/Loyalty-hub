# LoyaltyHub Cloud Functions

Phase 1 establishes the Cloud Functions runtime boundary.

Sensitive loyalty mutations are not implemented in Phase 1.
Functions must derive authorization from authenticated Firebase identity.
Client-provided tenant ownership, balances, reward costs and audit timestamps are never trusted.
Production secrets must use supported secret/configuration mechanisms and must not be committed.

The exported healthCheck callable is a foundation smoke-test endpoint only.
