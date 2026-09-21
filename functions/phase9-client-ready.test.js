const test = require('node:test');
const assert = require('node:assert/strict');
const { DEMO_MERCHANT_ID, DEMO_CUSTOMER_ID, DEMO_REWARDS, buildDemoMerchant } = require('./demo-seed');

test('Phase 9 demo tenant is deterministic and presentation-ready', () => {
  const merchant = buildDemoMerchant();
  assert.equal(merchant.merchantId, DEMO_MERCHANT_ID);
  assert.equal(merchant.demo, true);
  assert.equal(merchant.status, 'active');
  assert.equal(merchant.branding.theme, 'light');
  assert.ok(DEMO_CUSTOMER_ID.startsWith('demo-'));
  assert.equal(DEMO_REWARDS.length, 3);
  assert.ok(DEMO_REWARDS.every(reward => Number.isSafeInteger(reward.pointsRequired) && reward.pointsRequired > 0));
});

test('Phase 9 demo rewards have complete multilingual labels', () => {
  for (const reward of DEMO_REWARDS) {
    assert.ok(reward.titleEn.trim());
    assert.ok(reward.titleAr.trim());
    assert.ok(reward.titleFr.trim());
  }
});
