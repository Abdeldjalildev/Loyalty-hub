# Phase 1 — Security Foundation

## Default posture

Protected Firestore data is deny-by-default.

## Client trust boundary

The browser may request operations but cannot authoritatively choose:
- merchant ownership;
- customer ownership;
- points balance;
- reward cost;
- actor identity;
- audit timestamps.

## Server boundary

Cloud Functions are the future execution boundary for sensitive mutations.

The Phase 1 healthCheck function performs no loyalty mutation.

## Secrets

- no service-account JSON in Git;
- no private keys in frontend;
- no production credentials in source;
- local environment files ignored.

## Phase 1 negative-security baseline

Before domain authorization is introduced, direct Firestore access to protected collections must fail.

Phase 2 will replace the blanket deny rules with explicit authenticated tenant rules and test both allowed and denied access.
