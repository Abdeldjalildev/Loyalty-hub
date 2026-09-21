const test = require("node:test");
const assert = require("node:assert/strict");
const admin = require("firebase-admin");
const { normalizeCustomer, validatePoints, validateReward, createCustomer, issuePoints, archiveCustomer, ensureLoyaltyProgram, listLoyaltyData, createQrToken, redeemReward, parseQrPayload } = require("./loyalty");
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

test("point issuance creates an immutable ledger entry and is idempotent", async () => {
  const merchantId = "phase4-earn-" + Date.now();
  const customer = await createCustomer(db, merchantId, { name: "Ledger Customer", email: "ledger@example.test", phone: "0555000001" });
  const first = await issuePoints(db, merchantId, customer.id, 100, "owner-a", "earn-key-123456");
  const replay = await issuePoints(db, merchantId, customer.id, 100, "owner-a", "earn-key-123456");
  assert.equal(first.balanceAfter, 100);
  assert.equal(replay.balanceAfter, 100);
  assert.equal(replay.idempotentReplay, true);
  const ledger = await db.collection("merchants/" + merchantId + "/transactions").where("customerId", "==", customer.id).get();
  assert.equal(ledger.size, 1);
  assert.equal(ledger.docs[0].data().type, "earn");
  await db.recursiveDelete(db.doc("merchants/" + merchantId));
});

test("secure QR redemption atomically consumes the token, reward, balance and ledger", async () => {
  const merchantId = "phase4-redeem-" + Date.now();
  const customer = await createCustomer(db, merchantId, { name: "Redeem Customer", email: "redeem@example.test", phone: "0555000002" });
  await issuePoints(db, merchantId, customer.id, 100, "owner-a", "earn-key-" + Date.now());
  await ensureLoyaltyProgram(db, merchantId);
  const rewards = await db.collection("merchants/" + merchantId + "/rewards").where("status", "==", "active").get();
  const reward = rewards.docs.find((doc) => doc.data().pointsRequired === 50);
  assert.ok(reward, "default 50-point reward must exist");
  const qr = await createQrToken(db, merchantId, customer.id, "owner-a");
  assert.match(qr.qrPayload, /^LHY2:/);
  assert.notEqual(qr.qrPayload, customer.id);

  const redeemed = await redeemReward(db, merchantId, qr.qrPayload, reward.id, "owner-a", "redeem-key-123456");
  assert.equal(redeemed.pointsCost, 50);
  assert.equal(redeemed.balanceBefore, 100);
  assert.equal(redeemed.balanceAfter, 50);

  const replay = await redeemReward(db, merchantId, qr.qrPayload, reward.id, "owner-a", "redeem-key-123456");
  assert.equal(replay.idempotentReplay, true);
  assert.equal(replay.redemptionId, redeemed.redemptionId);

  const persistedCustomer = await db.doc("merchants/" + merchantId + "/customers/" + customer.id).get();
  assert.equal(persistedCustomer.data().points, 50);
  const redemption = await db.doc("merchants/" + merchantId + "/redemptions/" + redeemed.redemptionId).get();
  assert.equal(redemption.data().status, "completed");
  const ledger = await db.doc("merchants/" + merchantId + "/transactions/" + redeemed.transactionId).get();
  assert.equal(ledger.data().type, "redeem");
  assert.equal(ledger.data().points, -50);

  await assert.rejects(
    () => redeemReward(db, merchantId, qr.qrPayload, reward.id, "owner-a", "different-key-123456"),
    /already been used/
  );
  await db.recursiveDelete(db.doc("merchants/" + merchantId));
});

test("concurrent redemption attempts cannot spend the same QR token twice", async () => {
  const merchantId = "phase4-race-" + Date.now();
  const customer = await createCustomer(db, merchantId, { name: "Race Customer", email: "race@example.test", phone: "0555000003" });
  await issuePoints(db, merchantId, customer.id, 100, "owner-a", "race-earn-" + Date.now());
  await ensureLoyaltyProgram(db, merchantId);
  const rewards = await db.collection("merchants/" + merchantId + "/rewards").where("status", "==", "active").get();
  const reward = rewards.docs.find((doc) => doc.data().pointsRequired === 50);
  const qr = await createQrToken(db, merchantId, customer.id, "owner-a");

  const attempts = await Promise.allSettled([
    redeemReward(db, merchantId, qr.qrPayload, reward.id, "owner-a", "race-key-a-123456"),
    redeemReward(db, merchantId, qr.qrPayload, reward.id, "owner-a", "race-key-b-123456"),
  ]);
  assert.equal(attempts.filter((item) => item.status === "fulfilled").length, 1);
  assert.equal(attempts.filter((item) => item.status === "rejected").length, 1);

  const persistedCustomer = await db.doc("merchants/" + merchantId + "/customers/" + customer.id).get();
  assert.equal(persistedCustomer.data().points, 50);
  const redemptions = await db.collection("merchants/" + merchantId + "/redemptions").get();
  assert.equal(redemptions.size, 1);
  await db.recursiveDelete(db.doc("merchants/" + merchantId));
});

test("invalid or raw customer identifiers cannot be used as secure QR payloads", async () => {
  assert.throws(() => parseQrPayload("customer-id-123"), /Invalid QR payload/);
  assert.throws(() => parseQrPayload("LHY2:short"), /Invalid QR token/);
});


test("a QR token is tenant-bound and cannot be redeemed by another merchant", async () => {
  const merchantA = "phase4-tenant-a-" + Date.now();
  const merchantB = "phase4-tenant-b-" + Date.now();
  const customerA = await createCustomer(db, merchantA, { name: "Tenant A Customer", email: "a@example.test", phone: "0555000004" });
  await issuePoints(db, merchantA, customerA.id, 100, "owner-a", "tenant-a-earn-123456");
  await ensureLoyaltyProgram(db, merchantA);
  await ensureLoyaltyProgram(db, merchantB);
  const rewardsB = await db.collection("merchants/" + merchantB + "/rewards").where("status", "==", "active").get();
  const rewardB = rewardsB.docs[0];
  const qr = await createQrToken(db, merchantA, customerA.id, "owner-a");
  await assert.rejects(
    () => redeemReward(db, merchantB, qr.qrPayload, rewardB.id, "owner-b", "tenant-b-redeem-123456"),
    /QR token not found/
  );
  const balanceA = await db.doc("merchants/" + merchantA + "/customers/" + customerA.id).get();
  assert.equal(balanceA.data().points, 100);
  await db.recursiveDelete(db.doc("merchants/" + merchantA));
  await db.recursiveDelete(db.doc("merchants/" + merchantB));
});
