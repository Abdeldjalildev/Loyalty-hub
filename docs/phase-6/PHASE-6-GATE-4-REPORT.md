# Phase 6 — Gate 4: Configuration Isolation

**Status: IMPLEMENTED / PENDING CI**

Isolation verification is implemented in functions/productization.test.js.

The test suite verifies:
- profile persistence belongs to the selected merchant;
- branding changes for merchant A do not alter merchant B;
- loyalty configuration is loaded from the requested merchant tenant;
- unsafe profile, branding, and loyalty values are rejected;
- all mutation callables derive the merchant tenant from authenticated merchantUsers context rather than a client-supplied merchant ID.
