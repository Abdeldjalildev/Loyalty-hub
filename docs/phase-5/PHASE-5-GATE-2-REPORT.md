# Phase 5 — Gate 2: Customer Portal

**Status: PASS / CLOSED**

A dedicated `/customer` SPA route provides:
- authenticated customer identity;
- current balance;
- available rewards and eligibility;
- recent transaction history;
- secure short-lived QR for redemption;
- refresh and sign-out controls.

Portal data is returned only for the authenticated customer's mapped tenant/customer record through callable functions.