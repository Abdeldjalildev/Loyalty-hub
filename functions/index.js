const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const { getApps, initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { ensureMerchantTenant } = require("./tenant");

setGlobalOptions({ region: "us-central1", maxInstances: 10 });
if (getApps().length === 0) initializeApp();

const db = getFirestore();

exports.healthCheck = onCall((request) => ({
  ok: true,
  authenticated: request.auth != null,
}));

exports.provisionMerchant = onCall(async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Authentication is required.");
  try {
    const merchant = await ensureMerchantTenant({
      db,
      uid: request.auth.uid,
      email: request.auth.token.email || null,
      displayName: request.data?.displayName,
    });
    return { merchantId: merchant.merchantId, name: merchant.name, role: "owner", status: merchant.status };
  } catch (error) {
    throw new HttpsError("invalid-argument", error.message);
  }
});

exports.getMerchantContext = onCall(async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Authentication is required.");
  const mapping = await db.doc(`merchantUsers/${request.auth.uid}`).get();
  if (!mapping.exists) throw new HttpsError("not-found", "Merchant tenant is not provisioned.");
  const data = mapping.data();
  const merchant = await db.doc(`merchants/${data.merchantId}`).get();
  if (!merchant.exists) throw new HttpsError("failed-precondition", "Merchant tenant is missing.");
  return { merchantId: data.merchantId, role: data.role, status: data.status, merchant: merchant.data() };
});
