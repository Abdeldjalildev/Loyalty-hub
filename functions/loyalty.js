const crypto = require("node:crypto");
const { FieldValue, Timestamp } = require("firebase-admin/firestore");

const DEFAULT_REWARDS = [
  { key: "free-coffee", titleEn: "Free Coffee", titleAr: "قهوة مجانية", titleFr: "Café Gratuit", pointsRequired: 50 },
  { key: "free-breakfast", titleEn: "Free Breakfast Meal", titleAr: "وجبة فطور مجانية", titleFr: "Petit Déjeuner Gratuit", pointsRequired: 150 },
  { key: "discount-50", titleEn: "50% Discount Voucher", titleAr: "قسيمة تخفيض 50%", titleFr: "Bon de Réduction 50%", pointsRequired: 100 },
];

const QR_PREFIX = "LHY2:";
const QR_TTL_MS = 5 * 60 * 1000;

function requiredString(value, field, min, max) {
  if (typeof value !== "string") throw new Error(field + " must be a string");
  const normalized = value.trim();
  if (normalized.length < min || normalized.length > max) throw new Error(field + " must contain " + min + "-" + max + " characters");
  return normalized;
}

function optionalString(value, field, max) {
  if (value == null || value === "") return "";
  if (typeof value !== "string") throw new Error(field + " must be a string");
  const normalized = value.trim();
  if (normalized.length > max) throw new Error(field + " must contain at most " + max + " characters");
  return normalized;
}

function normalizeCustomer(input) {
  return {
    name: requiredString(input?.name, "name", 2, 120),
    email: optionalString(input?.email, "email", 254).toLowerCase(),
    phone: optionalString(input?.phone, "phone", 32),
  };
}

function validatePoints(value) {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value <= 0) throw new Error("points must be a positive integer");
  return value;
}

function validateReward(input) {
  return {
    titleEn: requiredString(input?.titleEn, "titleEn", 1, 120),
    titleAr: requiredString(input?.titleAr, "titleAr", 1, 120),
    titleFr: requiredString(input?.titleFr, "titleFr", 1, 120),
    pointsRequired: validatePoints(input?.pointsRequired),
  };
}

function validateIdempotencyKey(value) {
  if (value == null || value === "") return null;
  return requiredString(value, "idempotencyKey", 8, 128);
}

function hashToken(value) {
  return crypto.createHash("sha256").update(value, "utf8").digest("hex");
}

function parseQrPayload(payload) {
  const value = requiredString(payload, "qrPayload", QR_PREFIX.length + 16, 512);
  if (!value.startsWith(QR_PREFIX)) throw new Error("Invalid QR payload");
  const token = value.slice(QR_PREFIX.length);
  if (!/^[A-Za-z0-9_-]{32,128}$/.test(token)) throw new Error("Invalid QR token");
  return token;
}

function transactionIdFromKey(prefix, key) {
  return prefix + "_" + hashToken(key).slice(0, 40);
}

async function ensureLoyaltyProgram(db, merchantId) {
  const programRef = db.doc("merchants/" + merchantId + "/loyaltyPrograms/default");
  const rewardsRef = db.collection("merchants/" + merchantId + "/rewards");
  if (!(await programRef.get()).exists) {
    await db.runTransaction(async (transaction) => {
      const current = await transaction.get(programRef);
      if (!current.exists) {
        transaction.create(programRef, {
          programId: "default",
          merchantId,
          name: "Default Loyalty Program",
          pointsPerUnit: 1,
          minimumRewardPoints: 1,
          maxPointsPerTransaction: 1000000,
          status: "active",
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
    });
  }
  if ((await rewardsRef.limit(1).get()).empty) {
    const batch = db.batch();
    for (const reward of DEFAULT_REWARDS) {
      const ref = rewardsRef.doc(reward.key);
      batch.create(ref, {
        ...reward,
        rewardId: reward.key,
        merchantId,
        status: "active",
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    }
    await batch.commit();
  }
  return programRef;
}

async function listLoyaltyData(db, merchantId) {
  await ensureLoyaltyProgram(db, merchantId);
  const [customersSnapshot, rewardsSnapshot, programSnapshot] = await Promise.all([
    db.collection("merchants/" + merchantId + "/customers").where("status", "==", "active").get(),
    db.collection("merchants/" + merchantId + "/rewards").where("status", "==", "active").get(),
    db.doc("merchants/" + merchantId + "/loyaltyPrograms/default").get(),
  ]);
  return {
    program: { id: programSnapshot.id, ...programSnapshot.data() },
    customers: customersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
    rewards: rewardsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
  };
}

async function createCustomer(db, merchantId, input) {
  const customer = normalizeCustomer(input);
  const ref = db.collection("merchants/" + merchantId + "/customers").doc();
  await ref.create({
    customerId: ref.id,
    merchantId,
    ...customer,
    points: 0,
    status: "active",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return { id: ref.id, ...customer, points: 0, status: "active" };
}

async function updateCustomer(db, merchantId, customerId, input) {
  const id = requiredString(customerId, "customerId", 1, 128);
  const customer = normalizeCustomer(input);
  const ref = db.doc("merchants/" + merchantId + "/customers/" + id);
  const snapshot = await ref.get();
  if (!snapshot.exists) throw new Error("Customer not found");
  await ref.update({ ...customer, updatedAt: FieldValue.serverTimestamp() });
  return { id, ...snapshot.data(), ...customer };
}

async function archiveCustomer(db, merchantId, customerId) {
  const id = requiredString(customerId, "customerId", 1, 128);
  const ref = db.doc("merchants/" + merchantId + "/customers/" + id);
  if (!(await ref.get()).exists) throw new Error("Customer not found");
  await ref.update({ status: "archived", updatedAt: FieldValue.serverTimestamp() });
  return { id, status: "archived" };
}

async function createReward(db, merchantId, input) {
  const reward = validateReward(input);
  const ref = db.collection("merchants/" + merchantId + "/rewards").doc();
  await ref.create({
    rewardId: ref.id,
    merchantId,
    ...reward,
    status: "active",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return { id: ref.id, ...reward, status: "active" };
}

async function updateReward(db, merchantId, rewardId, input) {
  const id = requiredString(rewardId, "rewardId", 1, 128);
  const reward = validateReward(input);
  const ref = db.doc("merchants/" + merchantId + "/rewards/" + id);
  const snapshot = await ref.get();
  if (!snapshot.exists) throw new Error("Reward not found");
  await ref.update({ ...reward, updatedAt: FieldValue.serverTimestamp() });
  return { id, ...snapshot.data(), ...reward };
}

async function issuePoints(db, merchantId, customerId, points, actorUid, idempotencyKey) {
  const id = requiredString(customerId, "customerId", 1, 128);
  const amount = validatePoints(points);
  const key = validateIdempotencyKey(idempotencyKey);
  const transactionRef = key
    ? db.doc("merchants/" + merchantId + "/transactions/" + transactionIdFromKey("earn", key))
    : db.collection("merchants/" + merchantId + "/transactions").doc();
  const customerRef = db.doc("merchants/" + merchantId + "/customers/" + id);
  let result;

  await db.runTransaction(async (transaction) => {
    const existing = await transaction.get(transactionRef);
    if (existing.exists) {
      const data = existing.data();
      if (data.type !== "earn" || data.customerId !== id || data.points !== amount) {
        throw new Error("Idempotency key is already bound to a different point issuance");
      }
      result = {
        transactionId: existing.id,
        customerId: data.customerId,
        pointsAdded: data.points,
        balanceBefore: data.balanceBefore,
        balanceAfter: data.balanceAfter,
        idempotentReplay: true,
      };
      return;
    }

    const snapshot = await transaction.get(customerRef);
    if (!snapshot.exists || snapshot.data().status !== "active") throw new Error("Customer not found");
    const current = snapshot.data().points;
    if (!Number.isSafeInteger(current) || current < 0) throw new Error("Customer balance is invalid");
    const balanceAfter = current + amount;
    if (!Number.isSafeInteger(balanceAfter)) throw new Error("Point balance exceeds safe integer range");

    transaction.update(customerRef, {
      points: balanceAfter,
      updatedAt: FieldValue.serverTimestamp(),
    });
    transaction.create(transactionRef, {
      transactionId: transactionRef.id,
      merchantId,
      customerId: id,
      type: "earn",
      points: amount,
      balanceBefore: current,
      balanceAfter,
      actorUid: actorUid || null,
      idempotencyKey: key,
      createdAt: FieldValue.serverTimestamp(),
    });
    result = {
      transactionId: transactionRef.id,
      customerId: id,
      pointsAdded: amount,
      balanceBefore: current,
      balanceAfter,
      idempotentReplay: false,
    };
  });
  return result;
}

async function createQrToken(db, merchantId, customerId, actorUid) {
  const id = requiredString(customerId, "customerId", 1, 128);
  const customerRef = db.doc("merchants/" + merchantId + "/customers/" + id);
  const customer = await customerRef.get();
  if (!customer.exists || customer.data().status !== "active") throw new Error("Customer not found");

  const token = crypto.randomBytes(32).toString("base64url");
  const tokenHash = hashToken(token);
  const expiresAt = Date.now() + QR_TTL_MS;
  const tokenRef = db.doc("merchants/" + merchantId + "/qrTokens/" + tokenHash);
  await tokenRef.create({
    qrTokenId: tokenHash,
    merchantId,
    customerId: id,
    issuedByUid: actorUid || null,
    issuedAt: FieldValue.serverTimestamp(),
    expiresAt: Timestamp.fromMillis(expiresAt),
    status: "active",
    consumedAt: null,
  });

  return {
    customerId: id,
    qrPayload: QR_PREFIX + token,
    expiresAt,
    ttlSeconds: Math.floor(QR_TTL_MS / 1000),
  };
}

async function redeemReward(db, merchantId, qrPayload, rewardId, actorUid, idempotencyKey) {
  const token = parseQrPayload(qrPayload);
  const tokenHash = hashToken(token);
  const rewardKey = requiredString(rewardId, "rewardId", 1, 128);
  const key = validateIdempotencyKey(idempotencyKey) || crypto.randomBytes(16).toString("hex");
  const redemptionId = transactionIdFromKey("redemption", key);
  const redemptionRef = db.doc("merchants/" + merchantId + "/redemptions/" + redemptionId);
  const transactionRef = db.doc("merchants/" + merchantId + "/transactions/" + redemptionId);
  const tokenRef = db.doc("merchants/" + merchantId + "/qrTokens/" + tokenHash);
  const rewardRef = db.doc("merchants/" + merchantId + "/rewards/" + rewardKey);
  let result;

  await db.runTransaction(async (transaction) => {
    const existing = await transaction.get(redemptionRef);
    if (existing.exists) {
      const data = existing.data();
      if (data.rewardId !== rewardKey) {
        throw new Error("Idempotency key is already bound to a different redemption");
      }
      result = { ...data, redemptionId: existing.id, idempotentReplay: true };
      return;
    }

    const tokenSnapshot = await transaction.get(tokenRef);
    const rewardSnapshot = await transaction.get(rewardRef);
    if (!tokenSnapshot.exists) throw new Error("QR token not found");
    const tokenData = tokenSnapshot.data();
    if (tokenData.status !== "active" || tokenData.consumedAt) throw new Error("QR token has already been used");
    const expiresAt = tokenData.expiresAt?.toMillis?.() ?? 0;
    if (expiresAt <= Date.now()) throw new Error("QR token has expired");

    if (!rewardSnapshot.exists || rewardSnapshot.data().status !== "active") throw new Error("Reward not found");
    const reward = rewardSnapshot.data();
    const customerId = requiredString(tokenData.customerId, "customerId", 1, 128);
    const customerRef = db.doc("merchants/" + merchantId + "/customers/" + customerId);
    const customerSnapshot = await transaction.get(customerRef);
    if (!customerSnapshot.exists || customerSnapshot.data().status !== "active") throw new Error("Customer not found");

    const current = customerSnapshot.data().points;
    const cost = reward.pointsRequired;
    if (!Number.isSafeInteger(current) || current < 0) throw new Error("Customer balance is invalid");
    if (!Number.isSafeInteger(cost) || cost <= 0) throw new Error("Reward cost is invalid");
    if (current < cost) throw new Error("Insufficient points");
    const balanceAfter = current - cost;

    transaction.update(customerRef, {
      points: balanceAfter,
      updatedAt: FieldValue.serverTimestamp(),
    });
    transaction.update(tokenRef, {
      status: "consumed",
      consumedAt: FieldValue.serverTimestamp(),
      consumedByUid: actorUid || null,
    });
    transaction.create(redemptionRef, {
      redemptionId,
      merchantId,
      customerId,
      rewardId: rewardKey,
      rewardTitleEn: reward.titleEn,
      rewardTitleAr: reward.titleAr,
      rewardTitleFr: reward.titleFr,
      pointsCost: cost,
      balanceBefore: current,
      balanceAfter,
      actorUid: actorUid || null,
      qrTokenId: tokenHash,
      idempotencyKey: key,
      status: "completed",
      createdAt: FieldValue.serverTimestamp(),
    });
    transaction.create(transactionRef, {
      transactionId: redemptionId,
      merchantId,
      customerId,
      type: "redeem",
      points: -cost,
      balanceBefore: current,
      balanceAfter,
      rewardId: rewardKey,
      redemptionId,
      actorUid: actorUid || null,
      idempotencyKey: key,
      createdAt: FieldValue.serverTimestamp(),
    });

    result = {
      redemptionId,
      transactionId: redemptionId,
      customerId,
      rewardId: rewardKey,
      pointsCost: cost,
      balanceBefore: current,
      balanceAfter,
      status: "completed",
      idempotentReplay: false,
    };
  });

  return result;
}

async function listTransactions(db, merchantId, customerId) {
  const collection = db.collection("merchants/" + merchantId + "/transactions");
  const snapshot = customerId
    ? await collection.where("customerId", "==", requiredString(customerId, "customerId", 1, 128)).limit(100).get()
    : await collection.limit(100).get();
  return snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .sort((a, b) => {
      const aMs = a.createdAt?.toMillis?.() || 0;
      const bMs = b.createdAt?.toMillis?.() || 0;
      return bMs - aMs;
    });
}

module.exports = {
  DEFAULT_REWARDS,
  QR_PREFIX,
  normalizeCustomer,
  validatePoints,
  validateReward,
  validateIdempotencyKey,
  parseQrPayload,
  listCustomerPortalData,
  ensureLoyaltyProgram,
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
};


async function listCustomerPortalData(db, merchantId, customerId) {
  await ensureLoyaltyProgram(db, merchantId);
  const customerRef = db.doc("merchants/" + merchantId + "/customers/" + customerId);
  const customerSnapshot = await customerRef.get();
  if (!customerSnapshot.exists || customerSnapshot.data().status !== "active") throw new Error("Customer not found");
  const [rewardsSnapshot, programSnapshot, transactionsSnapshot] = await Promise.all([
    db.collection("merchants/" + merchantId + "/rewards").where("status", "==", "active").get(),
    db.doc("merchants/" + merchantId + "/loyaltyPrograms/default").get(),
    db.collection("merchants/" + merchantId + "/transactions").where("customerId", "==", customerId).orderBy("createdAt", "desc").limit(50).get(),
  ]);
  return {
    customer: { id: customerSnapshot.id, ...customerSnapshot.data() },
    program: { id: programSnapshot.id, ...programSnapshot.data() },
    rewards: rewardsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
    transactions: transactionsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
  };
}
