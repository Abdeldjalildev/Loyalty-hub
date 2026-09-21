const test = require("node:test");
const assert = require("node:assert/strict");
const { getApps, initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { ensureMerchantTenant } = require("./tenant");
if (getApps().length === 0) initializeApp({ projectId: process.env.GCLOUD_PROJECT || "loyal-hub-project" });
const db = getFirestore();

test("provisions exactly one merchant tenant per authenticated UID", async () => {
  const uid = `phase2-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const first = await ensureMerchantTenant({ db, uid, email: "owner@example.test", displayName: "Phase 2 Merchant" });
  const second = await ensureMerchantTenant({ db, uid, email: "owner@example.test", displayName: "Ignored Second Name" });
  assert.equal(first.merchantId, second.merchantId);
  assert.equal(second.name, "Phase 2 Merchant");
  assert.equal(second.ownerUid, uid);
  const mapping = await db.doc(`merchantUsers/${uid}`).get();
  assert.equal(mapping.data().merchantId, first.merchantId);
  assert.equal(mapping.data().role, "owner");
  await db.doc(`merchantUsers/${uid}`).delete();
  await db.doc(`merchants/${first.merchantId}`).delete();
});

test("rejects invalid merchant display names", async () => {
  await assert.rejects(
    ensureMerchantTenant({ db, uid: `invalid-${Date.now()}`, email: "owner@example.test", displayName: "x" }),
    /displayName must contain 2-80 characters/
  );
});
