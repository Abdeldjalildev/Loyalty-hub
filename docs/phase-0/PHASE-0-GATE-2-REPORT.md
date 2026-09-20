# Phase 0 — Gate 2 Closure Report
## MVP Contract

**Status: PASS / CLOSED**

### 1. Gate objective

Gate 2 converts the existing demo concept into an explicit first-sellable MVP contract.

This gate defines:
- the customer and merchant jobs the MVP must support;
- the minimum production workflows;
- what is deliberately excluded;
- the access model that later phases must implement;
- acceptance criteria that prevent scope drift.

No Firebase implementation, dependency change, UI rewrite, or production business-logic implementation was performed in this gate.

---

## 2. Product boundary

LoyaltyHub MVP is a **multi-tenant digital loyalty platform for small businesses** such as cafés, restaurants, shops, salons/barbers, and similar businesses.

The MVP supports one business operating its own loyalty program while guaranteeing that one merchant cannot access another merchant's protected data.

The core sellable loop is:

**Merchant account → business setup → loyalty rules/rewards → customer enrollment → points issuance → customer balance → customer QR identity → merchant redemption → transaction history → basic analytics**

The MVP is a loyalty product, not a payment/POS/accounting system.

---

## 3. Merchant MVP — IN SCOPE

### 3.1 Merchant identity and access
The merchant can:
- create an authenticated merchant account;
- sign in;
- sign out;
- maintain an authenticated session;
- access only their own business data.

MVP merchant role:
- **Merchant Owner** — the authenticated owner/operator of one business tenant.

Additional staff roles and granular team permissions are out of scope for the first MVP.

### 3.2 Merchant/business profile
The merchant can manage:
- business name;
- logo/brand asset reference;
- description;
- phone/contact information;
- relevant public contact/social links;
- basic display/theme settings.

### 3.3 Loyalty program
The MVP supports **one active loyalty program per merchant**.

The merchant can configure:
- program name;
- points earning rule;
- program active/inactive status;
- basic program description/instructions.

The first MVP uses a simple deterministic earning model. Complex tiering, memberships, campaigns, expiration schedules, referrals, and conditional promotions are out of scope.

### 3.4 Rewards
The merchant can:
- create a reward;
- edit a reward;
- activate/deactivate a reward;
- define its points cost;
- define its display name/description;
- optionally provide localized display text where the existing product language model requires it.

A reward belongs to exactly one merchant/program context.

Reward cost is authoritative server-side and cannot be trusted from the client.

### 3.5 Customer management
The merchant can:
- create/enroll a customer;
- view their customers;
- view an individual customer's loyalty status;
- update permitted customer profile fields;
- deactivate/archive a customer without destroying historical transaction records.

Customer identity is production-safe and server-generated. Existing short random IDs such as `CUST-1234` are not the production identity mechanism.

### 3.6 Points issuance
The merchant can issue loyalty points to an eligible customer.

The MVP requires:
- authenticated merchant authorization;
- valid positive integer point amount;
- customer ownership validation;
- authoritative server-side mutation;
- resulting balance;
- persistent auditable transaction.

The client cannot directly set a customer's balance.

### 3.7 Redemption
The merchant can redeem an active reward for an eligible customer.

The MVP requires:
- authenticated merchant authorization;
- customer ownership validation;
- reward ownership/availability validation;
- authoritative reward cost lookup;
- sufficient-balance check;
- atomic point deduction plus transaction/redemption record;
- verified success response before UI success feedback.

The current frontend campaign-ID-to-numeric-cost defect is not patched here. Its authoritative correction is scheduled for Phase 4.

### 3.8 Transaction history
The merchant can view persistent loyalty transactions relevant to their tenant.

At minimum the history distinguishes:
- points issued;
- reward redeemed.

Transactions are immutable business records after creation except for explicitly permitted metadata correction fields defined by later implementation.

### 3.9 Basic analytics
The MVP provides basic merchant-level metrics derived from trusted persistent data, such as:
- customer count;
- active customer count;
- points issued;
- points redeemed;
- redemption count/rate where derivable;
- customer growth/activity where the available data supports it.

Advanced BI, forecasting, cohort analysis, exports, and custom report builders are out of scope.

### 3.10 Branding/settings
The merchant can manage the minimum configuration needed for a client-ready branded loyalty experience.

Full white-labeling, custom domains, per-client source-code customization, and enterprise branding controls are out of scope.

---

## 4. Customer MVP — IN SCOPE

### 4.1 Customer access model

For the first MVP, the customer self-service portal uses **Firebase Authentication with email-link (passwordless) sign-in**.

Rules:
- customer email is the portal identity anchor;
- the customer must be explicitly enrolled/associated with a merchant customer record;
- access must resolve to the authenticated customer's own record;
- customer cannot select an arbitrary customer ID to enter another account;
- phone-only customers may exist as merchant-managed records, but self-service portal access requires a verified email enrollment in this MVP.

Password-based authentication, phone/SMS authentication, social providers, and anonymous customer access are out of scope unless a later product requirement explicitly changes the contract.

### 4.2 Customer portal
An authenticated customer can view:
- their own profile/loyalty identity;
- current points balance;
- active rewards and required points;
- their loyalty transaction/history view;
- their digital loyalty card;
- their secure QR identity mechanism.

The customer cannot directly modify their points balance, reward cost, merchant ownership, or transaction records.

### 4.3 Customer QR
The MVP includes a QR experience for merchant-assisted identification/redemption.

The QR is **not** an authorization proof by itself.

The final QR mechanism must be designed so that:
- raw customer IDs are not treated as sufficient authorization;
- the merchant is authenticated;
- the customer belongs to that merchant;
- any token/signature/expiry/replay requirements are enforced server-side.

Detailed QR implementation is Phase 4 scope.

---

## 5. Core acceptance scenarios

The MVP contract is considered satisfied only when the following business scenarios are supported by later implementation phases.

### Scenario A — Merchant onboarding
1. Merchant creates an account.
2. Merchant authenticates.
3. Merchant creates/loads their business profile.
4. Merchant configures the loyalty program.
5. Merchant creates at least one reward.

### Scenario B — Customer enrollment
1. Merchant enrolls a customer.
2. Customer record belongs to that merchant.
3. Customer receives/uses the defined access mechanism.
4. Customer can access only their own loyalty information.

### Scenario C — Earn points
1. Authenticated merchant selects an owned customer.
2. Merchant submits a valid positive point amount.
3. Backend validates authorization and ownership.
4. Backend records the point transaction.
5. Customer balance increases by the authoritative amount.
6. Merchant/customer views reflect the persisted result.

### Scenario D — Redeem reward
1. Authenticated merchant identifies an owned customer.
2. Merchant selects an owned active reward.
3. Backend reads the authoritative reward cost.
4. Backend verifies sufficient balance.
5. Backend atomically deducts points and records the redemption/transaction.
6. UI reports success only after verified backend success.
7. New balance and history are persisted.

### Scenario E — Tenant isolation
1. Merchant A authenticates.
2. Merchant B's customer/reward/transaction identifiers are presented to Merchant A through a manipulated request.
3. Backend rejects unauthorized access.
4. The same isolation applies to reads and writes.

### Scenario F — Customer isolation
1. Customer A authenticates.
2. Customer A attempts to access Customer B's identifier/data.
3. Backend/database boundaries reject the request.
4. Customer A can still access their own balance/history/rewards.

---

## 6. Explicitly OUT OF SCOPE for MVP

The following are not part of the first sellable MVP unless explicitly re-approved:

### Payments and finance
- payment processing;
- subscriptions/billing;
- POS/payment terminal integration;
- invoices;
- accounting;
- cash management.

### Advanced loyalty
- tiered loyalty levels;
- VIP memberships;
- points expiration;
- referrals/affiliate rewards;
- birthday campaigns;
- scheduled campaigns;
- complex conditional promotions;
- coupon marketplace;
- cross-merchant loyalty networks.

### Advanced customer engagement
- push notifications;
- SMS campaigns;
- email marketing automation;
- WhatsApp automation;
- segmentation/marketing journeys;
- reviews/reputation features.

### Advanced merchant organization
- multiple staff accounts;
- granular staff roles;
- approval workflows;
- multi-location organizations;
- franchise hierarchy;
- enterprise SSO.

### Advanced analytics/data
- advanced BI;
- predictive analytics;
- custom report builder;
- data warehouse;
- public API;
- bulk import/export workflows unless later required for onboarding.

### Platform expansion
- native iOS/Android applications;
- offline-first operation;
- custom domains/white-label infrastructure;
- marketplace/ecosystem;
- third-party POS integrations.

### Security/product features not required for first MVP
- biometric authentication;
- hardware security keys;
- advanced fraud scoring;
- complex device trust systems.

Basic secure authentication, authorization, tenant isolation, input validation, auditability, and abuse protection remain mandatory; they are not optional "advanced" features.

---

## 7. MVP non-negotiable quality constraints

The MVP must not:
- trust client-supplied balances;
- trust client-supplied reward costs;
- allow cross-merchant data access;
- allow a customer to impersonate another customer by changing an identifier;
- report a point/reward mutation as successful before backend confirmation;
- use localStorage as the authoritative loyalty database;
- use a raw customer ID as sufficient QR authorization;
- lose the audit trail of point-changing operations.

---

## 8. Phase allocation

The contract intentionally distributes implementation across later phases:

| Contract area | Primary phase |
|---|---|
| Product/domain contract | Phase 0 |
| Firebase foundation | Phase 1 |
| Merchant authentication | Phase 2 |
| Tenant isolation/authorization | Phase 2 |
| Persistent customers/rewards/points | Phase 3 |
| Secure transactions/redemption | Phase 4 |
| Secure QR | Phase 4 |
| Real customer portal | Phase 5 |
| Branding/configuration | Phase 6 |
| Commercial UX/analytics | Phase 7 |
| Production hardening | Phase 8 |
| Client-ready onboarding/demo | Phase 9 |

No later-phase implementation is pulled forward merely to satisfy this contract gate.

---

## 9. Gate 2 verification

### Scope verification
- Merchant MVP is explicitly defined.
- Customer MVP is explicitly defined.
- Customer access model is explicitly selected.
- Core earn/redeem flows are explicitly defined.
- Tenant/customer isolation requirements are explicit.
- MVP exclusions are explicit.
- Quality/security constraints are explicit.
- Later-phase ownership is explicit.

### Implementation verification
No product implementation was performed.

### Security verification
The contract explicitly requires:
- authenticated merchant access;
- authenticated customer access;
- backend tenant isolation;
- server-authoritative points/reward costs;
- atomic redemption;
- QR non-trust by default;
- persistent auditability.

### Gate 2 decision

**PASS / CLOSED**

The MVP scope is now sufficiently explicit to serve as the constraint for domain modeling.

Next authorized step:

**Phase 0 — Gate 3: Domain Model**

