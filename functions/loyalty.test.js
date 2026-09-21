const test = require("node:test");
const assert = require("node:assert/strict");
const admin = require("firebase-admin");
const { normalizeCustomer, validatePoints, validateReward, createCustomer, issuePoints, archiveCustomer, ensureLoyaltyProgram, listLoyaltyData } = require("./loyalty");
const PROJECT_ID = process.env.GCLOUD_PROJECT || "loyal-hub-project";
if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT_ID });
const db = admin.firestore();
test("customer input is normalized and validated", () => {
  assert.deepEqual(normalizeCustomer({ name: "  Sara  ", email: "SARA@EXAMPLE.COM", phone: " 0555 " }), { name: "Sara", email: "sara@example.com", phone: "0555" });
  assert.throws(() => normalizeCustomer({ name: "x" }), /name must contain/);
});
test("points and reward validation reject invalid values", () => {
  assert.equal(validatePoints(10), 10);
  assert.throws(() => validatePoints(0), /positive integer/);
  assert.throws(() => validatePoints(-5), /positive integer/);
  assert.throws(() => validatePoints(Number.NaN), /positive integer/);
  assert.throws(() => validatePoints(1.5), /positive integer/);
  assert.equal(validateReward({ titleEn: "Coffee", titleAr: "قهوة", titleFr: "Café", pointsRequired: 50 }).pointsRequired, 50);
  assert.throws(() => validateReward({ titleEn: "Coffee", titleAr: "قهوة", titleFr: "Café", pointsRequired: -1 }), /positive integer/);
});
test("customer persistence survives reload and points issuance is transactional", async () => {
  const merchantId = "phase3-" + Date.now();
  const customer = await createCustomer(db, merchantId, { name: "Persistence Customer", email: "persist@example.test", phone: "0555000000" });
  const issued = await issuePoints(db, merchantId, customer.id, 25);
  assert.deepEqual({ before: issued.balanceBefore, after: issued.balanceAfter }, { before: 0, after: 25 });
  const persisted = await db.doc("merchants/" + merchantId + "/customers/" + customer.id).get();
  assert.equal(persisted.data().points, 25);
  await archiveCustomer(db, merchantId, customer.id);
  assert.equal((await db.doc("merchants/" + merchantId + "/customers/" + customer.id).get()).data().status, "archived");
  await db.recursiveDelete(db.doc("merchants/" + merchantId));
});
test("loyalty program and rewards are persisted per merchant", async () => {
  const merchantId = "phase3-rewards-" + Date.now();
  await ensureLoyaltyProgram(db, merchantId);
  const first = await listLoyaltyData(db, merchantId);
  const second = await listLoyaltyData(db, merchantId);
  assert.equal(first.program.status, "active");
  assert.equal(first.rewards.length, 3);
  assert.equal(second.rewards.length, 3);
  assert.equal(first.rewards[0].merchantId, merchantId);
  await db.recursiveDelete(db.doc("merchants/" + merchantId));
});