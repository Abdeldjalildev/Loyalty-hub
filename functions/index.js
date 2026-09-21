const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const { getApps, initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { ensureMerchantTenant } = require("./tenant");
const { provisionCustomer, getCustomerContext } = require("./customer");
const { updateMerchantProfile, updateMerchantBranding, updateLoyaltyConfig, getMerchantProductConfig } = require("./productization");

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

const {
  listLoyaltyData,
  createCustomer,
  updateCustomer,
  archiveCustomer,
  createReward,
  updateReward,
  issuePoints,
  createQrToken,
  redeemReward,
  listTransactions,
  listCustomerPortalData,
} = require("./loyalty");

async function requireMerchantContext(request) {
  if (!request.auth) throw new HttpsError("unauthenticated", "Authentication is required.");
  const mapping = await db.doc("merchantUsers/" + request.auth.uid).get();
  if (!mapping.exists) throw new HttpsError("failed-precondition", "Merchant tenant is not provisioned.");
  const data = mapping.data();
  if (data.status !== "active" || data.role !== "owner") throw new HttpsError("permission-denied", "Merchant access is not active.");
  const merchant = await db.doc("merchants/" + data.merchantId).get();
  if (!merchant.exists || merchant.data().status !== "active") throw new HttpsError("failed-precondition", "Merchant tenant is not active.");
  return data.merchantId;
}

async function runMerchantMutation(request, operation) {
  const merchantId = await requireMerchantContext(request);
  try {
    return await operation(merchantId);
  } catch (error) {
    throw new HttpsError("invalid-argument", error instanceof Error ? error.message : "Invalid request.");
  }
}

exports.getMerchantProductConfig = onCall(async (request) => {
  const merchantId = await requireMerchantContext(request);
  try { return await getMerchantProductConfig({ db, merchantId }); }
  catch (error) { throw new HttpsError("internal", error instanceof Error ? error.message : "PRODUCT_CONFIG_LOAD_FAILED"); }
});

exports.updateMerchantProfile = onCall((request) => runMerchantMutation(request, (merchantId) =>
  updateMerchantProfile({ db, merchantId, input: request.data || {} })
));

exports.updateMerchantBranding = onCall((request) => runMerchantMutation(request, (merchantId) =>
  updateMerchantBranding({ db, merchantId, input: request.data || {} })
));

exports.updateLoyaltyConfig = onCall((request) => runMerchantMutation(request, (merchantId) =>
  updateLoyaltyConfig({ db, merchantId, input: request.data || {} })
));

exports.getLoyaltyData = onCall(async (request) => {
  const merchantId = await requireMerchantContext(request);
  try {
    return await listLoyaltyData(db, merchantId);
  } catch (error) {
    throw new HttpsError("internal", error instanceof Error ? error.message : "LOYALTY_LOAD_FAILED");
  }
});

exports.createCustomer = onCall((request) => runMerchantMutation(request, (merchantId) => createCustomer(db, merchantId, request.data || {})));

exports.updateCustomer = onCall((request) => runMerchantMutation(request, (merchantId) =>
  updateCustomer(db, merchantId, request.data?.customerId, request.data || {})
));

exports.archiveCustomer = onCall((request) => runMerchantMutation(request, (merchantId) =>
  archiveCustomer(db, merchantId, request.data?.customerId)
));

exports.createReward = onCall((request) => runMerchantMutation(request, (merchantId) =>
  createReward(db, merchantId, request.data || {})
));

exports.updateReward = onCall((request) => runMerchantMutation(request, (merchantId) =>
  updateReward(db, merchantId, request.data?.rewardId, request.data || {})
));

exports.issuePoints = onCall((request) => runMerchantMutation(request, (merchantId) =>
  issuePoints(
    db,
    merchantId,
    request.data?.customerId,
    request.data?.points,
    request.auth.uid,
    request.data?.idempotencyKey
  )
));


exports.createQrToken = onCall((request) => runMerchantMutation(request, (merchantId) =>
  createQrToken(db, merchantId, request.data?.customerId, request.auth.uid)
));

exports.redeemReward = onCall((request) => runMerchantMutation(request, (merchantId) =>
  redeemReward(
    db,
    merchantId,
    request.data?.qrPayload,
    request.data?.rewardId,
    request.auth.uid,
    request.data?.idempotencyKey
  )
));

exports.listTransactions = onCall(async (request) => {
  const merchantId = await requireMerchantContext(request);
  try {
    return { transactions: await listTransactions(db, merchantId, request.data?.customerId) };
  } catch (error) {
    throw new HttpsError("internal", error instanceof Error ? error.message : "TRANSACTION_LOAD_FAILED");
  }
});


exports.provisionCustomer = onCall(async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Authentication is required.");
  try {
    return await provisionCustomer({
      db,
      uid: request.auth.uid,
      email: request.auth.token.email,
      merchantId: request.data?.merchantId,
    });
  } catch (error) {
    throw new HttpsError("invalid-argument", error instanceof Error ? error.message : "CUSTOMER_PROVISIONING_FAILED");
  }
});

exports.getCustomerContext = onCall(async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Authentication is required.");
  try {
    return await getCustomerContext({ db, uid: request.auth.uid, email: request.auth.token.email });
  } catch (error) {
    throw new HttpsError("permission-denied", error instanceof Error ? error.message : "CUSTOMER_CONTEXT_FAILED");
  }
});

exports.getCustomerPortalData = onCall(async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Authentication is required.");
  try {
    const context = await getCustomerContext({ db, uid: request.auth.uid, email: request.auth.token.email });
    return await listCustomerPortalData(db, context.merchantId, context.customerId);
  } catch (error) {
    throw new HttpsError("permission-denied", error instanceof Error ? error.message : "CUSTOMER_PORTAL_LOAD_FAILED");
  }
});

exports.createCustomerQrToken = onCall(async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Authentication is required.");
  try {
    const context = await getCustomerContext({ db, uid: request.auth.uid, email: request.auth.token.email });
    return await createQrToken(db, context.merchantId, context.customerId, request.auth.uid);
  } catch (error) {
    throw new HttpsError("permission-denied", error instanceof Error ? error.message : "CUSTOMER_QR_FAILED");
  }
});

