const test = require("node:test");
const assert = require("node:assert/strict");
const admin = require("firebase-admin");
const { ensureLoyaltyProgram, createCustomer, createReward, issuePoints, redeemReward, createQrToken } = require("./loyalty");

if (!admin.apps.length) admin.initializeApp({ projectId: process.env.GCLOUD_PROJECT || "loyal-hub-project" });
const db = admin.firestore();

test("configured transaction limit is enforced server-side", async () => {
  const merchantId = "phase8-limit-" + Date.now();
  await ensureLoyaltyProgram(db, merchantId);
  await db.doc("merchants/" + merchantId + "/loyaltyPrograms/default").update({ maxPointsPerTransaction: 25 });
  const customer = await createCustomer(db, merchantId, { name: "Limit Customer", email: "limit-" + Date.now() + "@example.test", phone: "" });
  await assert.rejects(
    () => issuePoints(db, merchantId, customer.id, 26, "phase8-owner", "phase8-limit-key-123456"),
    /transaction limit/
  );
  const persisted = await db.doc("merchants/" + merchantId + "/customers/" + customer.id).get();
  assert.equal(persisted.data().points, 0);
  await db.recursiveDelete(db.doc("merchants/" + merchantId));
});

test("configured minimum reward points is enforced on reward creation", async () => {
  const merchantId = "phase8-reward-" + Date.now();
  await ensureLoyaltyProgram(db, merchantId);
  await db.doc("merchants/" + merchantId + "/loyaltyPrograms/default").update({ minimumRewardPoints: 100 });
  await assert.rejects(
    () => createReward(db, merchantId, { titleEn: "Too Cheap", titleAr: "رخيص", titleFr: "Trop Bas", pointsRequired: 50 }),
    /loyalty minimum/
  );
  const created = await createReward(db, merchantId, { titleEn: "Valid Reward", titleAr: "مكافأة", titleFr: "Récompense", pointsRequired: 100 });
  assert.equal(created.pointsRequired, 100);
  await db.recursiveDelete(db.doc("merchants/" + merchantId));
});

test("QR tokens remain opaque, tenant-bound and single-use under hardened flow", async () => {
  const merchantA = "phase8-qr-a-" + Date.now();
  const merchantB = "phase8-qr-b-" + Date.now();
  const customer = await createCustomer(db, merchantA, { name: "QR Customer", email: "qr-" + Date.now() + "@example.test", phone: "" });
  await ensureLoyaltyProgram(db, merchantA);
  await ensureLoyaltyProgram(db, merchantB);
  await issuePoints(db, merchantA, customer.id, 100, "phase8-owner", "phase8-qr-earn-123456");
  const rewards = await db.collection("merchants/" + merchantA + "/rewards").where("status", "==", "active").get();
  const reward = rewards.docs.find((doc) => doc.data().pointsRequired === 50);
  const qr = await createQrToken(db, merchantA, customer.id, "phase8-owner");
  assert.ok(qr.qrPayload.startsWith("LHY2:"));
  assert.notEqual(qr.qrPayload.includes(customer.id), true);
  const rewardB = (await db.collection("merchants/" + merchantB + "/rewards").limit(1).get()).docs[0];
  await assert.rejects(() => redeemReward(db, merchantB, qr.qrPayload, rewardB.id, "other-owner", "phase8-cross-123456"), /QR token not found/);
  const redeemed = await redeemReward(db, merchantA, qr.qrPayload, reward.id, "phase8-owner", "phase8-redeem-123456");
  assert.equal(redeemed.balanceAfter, 50);
  await assert.rejects(() => redeemReward(db, merchantA, qr.qrPayload, reward.id, "phase8-owner", "phase8-replay-123456"), /already been used/);
  await db.recursiveDelete(db.doc("merchants/" + merchantA));
  await db.recursiveDelete(db.doc("merchants/" + merchantB));
});
