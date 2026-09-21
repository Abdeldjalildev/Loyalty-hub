const test = require("node:test");
const assert = require("node:assert/strict");
const admin = require("firebase-admin");
const { ensureLoyaltyProgram } = require("./loyalty");
const { ensureMerchantTenant } = require("./tenant");
const { normalizeProfile, normalizeBranding, normalizeLoyalty, updateMerchantProfile, updateMerchantBranding, updateLoyaltyConfig, getMerchantProductConfig } = require("./productization");
if (!admin.apps.length) admin.initializeApp({ projectId: process.env.GCLOUD_PROJECT || "loyal-hub-project" });
const db = admin.firestore();

test("business profile validates and persists tenant-owned contact data", async () => {
  const uid = "phase6-profile-" + Date.now();
  const merchant = await ensureMerchantTenant({ db, uid, email: "profile@example.test", displayName: "Phase 6 Business" });
  const updated = await updateMerchantProfile({ db, merchantId: merchant.merchantId, input: {
    name: "Configured Coffee", description: "Local loyalty club", phone: "0555000010",
    websiteUrl: "https://example.com", instagramUrl: "https://instagram.com/example", facebookUrl: "", whatsappUrl: "", logoUrl: "https://example.com/logo.png"
  }});
  assert.equal(updated.name, "Configured Coffee");
  assert.equal(updated.description, "Local loyalty club");
  assert.equal(updated.websiteUrl, "https://example.com/");
  await assert.rejects(() => updateMerchantProfile({ db, merchantId: merchant.merchantId, input: { name: "x" }}), /name must contain/);
  await db.doc("merchantUsers/" + uid).delete(); await db.recursiveDelete(db.doc("merchants/" + merchant.merchantId));
});

test("branding and loyalty configuration are validated and persisted", async () => {
  const uid = "phase6-config-" + Date.now();
  const merchant = await ensureMerchantTenant({ db, uid, email: "config@example.test", displayName: "Config Business" });
  await ensureLoyaltyProgram(db, merchant.merchantId);
  const branding = await updateMerchantBranding({ db, merchantId: merchant.merchantId, input: { primaryColor: "#112233", secondaryColor: "#abcdef", theme: "dark" }});
  assert.deepEqual(branding.branding, { primaryColor: "#112233", secondaryColor: "#abcdef", theme: "dark" });
  const program = await updateLoyaltyConfig({ db, merchantId: merchant.merchantId, input: { pointsPerUnit: 2, minimumRewardPoints: 50, maxPointsPerTransaction: 1000 }});
  assert.equal(program.pointsPerUnit, 2);
  assert.equal(program.minimumRewardPoints, 50);
  const loaded = await getMerchantProductConfig({ db, merchantId: merchant.merchantId });
  assert.equal(loaded.merchant.branding.primaryColor, "#112233");
  assert.equal(loaded.program.maxPointsPerTransaction, 1000);
  await assert.rejects(() => updateMerchantBranding({ db, merchantId: merchant.merchantId, input: { primaryColor: "red", secondaryColor: "#abcdef", theme: "light" }}), /hex color/);
  await assert.rejects(() => updateLoyaltyConfig({ db, merchantId: merchant.merchantId, input: { pointsPerUnit: 0, minimumRewardPoints: 50, maxPointsPerTransaction: 1000 }}), /pointsPerUnit/);
  await db.doc("merchantUsers/" + uid).delete(); await db.recursiveDelete(db.doc("merchants/" + merchant.merchantId));
});

test("tenant configuration cannot cross merchant boundaries", async () => {
  const uidA = "phase6-a-" + Date.now(), uidB = "phase6-b-" + Date.now();
  const a = await ensureMerchantTenant({ db, uid: uidA, email: "a@example.test", displayName: "Merchant A" });
  const b = await ensureMerchantTenant({ db, uid: uidB, email: "b@example.test", displayName: "Merchant B" });
  await ensureLoyaltyProgram(db, a.merchantId); await ensureLoyaltyProgram(db, b.merchantId);
  await updateMerchantBranding({ db, merchantId: a.merchantId, input: { primaryColor: "#111111", secondaryColor: "#222222", theme: "light" }});
  const bConfig = await getMerchantProductConfig({ db, merchantId: b.merchantId });
  assert.notEqual(bConfig.merchant.branding?.primaryColor, "#111111");
  await db.doc("merchantUsers/" + uidA).delete(); await db.doc("merchantUsers/" + uidB).delete();
  await db.recursiveDelete(db.doc("merchants/" + a.merchantId)); await db.recursiveDelete(db.doc("merchants/" + b.merchantId));
});

test("normalizers reject unsafe product configuration", () => {
  assert.throws(() => normalizeProfile({ name: "A" }), /name must contain/);
  assert.throws(() => normalizeBranding({ primaryColor: "#123456", secondaryColor: "rgb(1,2,3)", theme: "light" }), /hex color/);
  assert.throws(() => normalizeLoyalty({ pointsPerUnit: 1, minimumRewardPoints: 0, maxPointsPerTransaction: 100 }), /minimumRewardPoints/);
});
