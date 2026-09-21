const test = require("node:test");
const assert = require("node:assert/strict");
const admin = require("firebase-admin");
const { updateMerchantProfile, updateMerchantBranding, normalizeBranding } = require("./merchant-profile");
const { ensureMerchantTenant } = require("./tenant");
if (!admin.apps.length) admin.initializeApp({ projectId: process.env.GCLOUD_PROJECT || "loyal-hub-project" });
const db = admin.firestore();

test("business profile and branding persist per tenant", async () => {
  const uidA = "phase6-a-" + Date.now();
  const uidB = "phase6-b-" + Date.now();
  const a = await ensureMerchantTenant({ db, uid: uidA, email: "a@example.test", displayName: "Merchant A" });
  const b = await ensureMerchantTenant({ db, uid: uidB, email: "b@example.test", displayName: "Merchant B" });
  await updateMerchantProfile({ db, merchantId: a.merchantId, input: { name: "Cafe Atlas", phone: "0555000011", address: "Annaba", website: "https://example.test" } });
  await updateMerchantBranding({ db, merchantId: a.merchantId, input: { primaryColor: "#123456", accentColor: "#abcdef", logoUrl: "" } });
  const aSnap = await db.doc("merchants/" + a.merchantId).get();
  const bSnap = await db.doc("merchants/" + b.merchantId).get();
  assert.equal(aSnap.data().name, "Cafe Atlas");
  assert.equal(aSnap.data().phone, "0555000011");
  assert.deepEqual(aSnap.data().branding, { primaryColor: "#123456", accentColor: "#abcdef", logoUrl: "" });
  assert.equal(bSnap.data().name, "Merchant B");
  assert.equal(bSnap.data().branding, undefined);
  await db.doc("merchantUsers/" + uidA).delete(); await db.doc("merchantUsers/" + uidB).delete();
  await db.doc("merchants/" + a.merchantId).delete(); await db.doc("merchants/" + b.merchantId).delete();
});
test("branding rejects invalid colors", () => {
  assert.throws(() => normalizeBranding({ primaryColor: "red", accentColor: "#123456" }), /primaryColor must be a 6-digit hex color/);
  assert.throws(() => normalizeBranding({ primaryColor: "#123456", accentColor: "#12" }), /accentColor must be a 6-digit hex color/);
});
