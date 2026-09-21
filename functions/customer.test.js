const test = require("node:test");
const assert = require("node:assert/strict");
const admin = require("firebase-admin");
const { provisionCustomer, getCustomerContext } = require("./customer");
const { createCustomer, ensureLoyaltyProgram, issuePoints, createQrToken, redeemReward } = require("./loyalty");

const PROJECT_ID = process.env.GCLOUD_PROJECT || "loyal-hub-project";
if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT_ID });
const db = admin.firestore();

test("customer identity maps a Firebase UID to exactly one tenant customer", async () => {
  const merchantId = "phase5-identity-" + Date.now();
  const email = "customer-" + Date.now() + "@example.test";
  const customer = await createCustomer(db, merchantId, { name: "Portal Customer", email, phone: "0555000005" });

  const provisioned = await provisionCustomer({ db, uid: "phase5-uid-a", email, merchantId });
  assert.equal(provisioned.customerId, customer.id);
  const context = await getCustomerContext({ db, uid: "phase5-uid-a", email });
  assert.equal(context.merchantId, merchantId);
  assert.equal(context.customerId, customer.id);

  await assert.rejects(
    () => provisionCustomer({ db, uid: "phase5-uid-b", email, merchantId }),
    /already has a portal account/
  );

  await db.recursiveDelete(db.doc("merchants/" + merchantId));
  await db.doc("customerUsers/phase5-uid-a").delete();
});

test("customer identity cannot be rebound across merchants", async () => {
  const merchantA = "phase5-a-" + Date.now();
  const merchantB = "phase5-b-" + Date.now();
  const email = "rebind-" + Date.now() + "@example.test";
  await createCustomer(db, merchantA, { name: "A", email, phone: "" });
  await createCustomer(db, merchantB, { name: "B", email: "other-" + Date.now() + "@example.test", phone: "" });
  await provisionCustomer({ db, uid: "phase5-uid-rebind", email, merchantId: merchantA });
  await assert.rejects(
    () => provisionCustomer({ db, uid: "phase5-uid-rebind", email, merchantId: merchantB }),
    /already linked to another merchant/
  );
  await db.recursiveDelete(db.doc("merchants/" + merchantA));
  await db.recursiveDelete(db.doc("merchants/" + merchantB));
  await db.doc("customerUsers/phase5-uid-rebind").delete();
});

test("customer portal QR can be redeemed only in its mapped tenant", async () => {
  const merchantId = "phase5-e2e-" + Date.now();
  const email = "e2e-" + Date.now() + "@example.test";
  const customer = await createCustomer(db, merchantId, { name: "E2E Customer", email, phone: "" });
  await ensureLoyaltyProgram(db, merchantId);
  await issuePoints(db, merchantId, customer.id, 100, "owner", "phase5-earn-" + Date.now());
  await provisionCustomer({ db, uid: "phase5-uid-e2e", email, merchantId });
  const qr = await createQrToken(db, merchantId, customer.id, "phase5-uid-e2e");
  const rewards = await db.collection("merchants/" + merchantId + "/rewards").where("status", "==", "active").get();
  const reward = rewards.docs.find((doc) => doc.data().pointsRequired === 50);
  const redeemed = await redeemReward(db, merchantId, qr.qrPayload, reward.id, "merchant-owner", "phase5-redeem-" + Date.now());
  assert.equal(redeemed.balanceAfter, 50);
  const context = await getCustomerContext({ db, uid: "phase5-uid-e2e", email });
  assert.equal(context.customer.points, 50);
  await db.recursiveDelete(db.doc("merchants/" + merchantId));
  await db.doc("customerUsers/phase5-uid-e2e").delete();
});

test("customer context cannot cross into another tenant", async () => {
  const merchantA = "phase5-cross-a-" + Date.now();
  const merchantB = "phase5-cross-b-" + Date.now();
  const emailA = "cross-a-" + Date.now() + "@example.test";
  const customerA = await createCustomer(db, merchantA, { name: "A", email: emailA, phone: "" });
  await createCustomer(db, merchantB, { name: "B", email: "cross-b-" + Date.now() + "@example.test", phone: "" });
  await provisionCustomer({ db, uid: "phase5-cross-uid", email: emailA, merchantId: merchantA });
  const own = await getCustomerContext({ db, uid: "phase5-cross-uid", email: emailA });
  assert.equal(own.customerId, customerA.id);
  assert.notEqual(own.merchantId, merchantB);
  await db.recursiveDelete(db.doc("merchants/" + merchantA));
  await db.recursiveDelete(db.doc("merchants/" + merchantB));
  await db.doc("customerUsers/phase5-cross-uid").delete();
});
