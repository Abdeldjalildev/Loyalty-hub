const { FieldValue } = require("firebase-admin/firestore");

const DEFAULT_REWARDS = [
  { key: "free-coffee", titleEn: "Free Coffee", titleAr: "قهوة مجانية", titleFr: "Café Gratuit", pointsRequired: 50 },
  { key: "free-breakfast", titleEn: "Free Breakfast Meal", titleAr: "وجبة فطور مجانية", titleFr: "Petit Déjeuner Gratuit", pointsRequired: 150 },
  { key: "discount-50", titleEn: "50% Discount Voucher", titleAr: "قسيمة تخفيض 50%", titleFr: "Bon de Réduction 50%", pointsRequired: 100 },
];

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
async function ensureLoyaltyProgram(db, merchantId) {
  const programRef = db.doc("merchants/" + merchantId + "/loyaltyPrograms/default");
  const rewardsRef = db.collection("merchants/" + merchantId + "/rewards");
  if (!(await programRef.get()).exists) {
    await db.runTransaction(async (transaction) => {
      const current = await transaction.get(programRef);
      if (!current.exists) transaction.create(programRef, { programId: "default", merchantId, name: "Default Loyalty Program", pointsPerUnit: 1, status: "active", createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
    });
  }
  if ((await rewardsRef.limit(1).get()).empty) {
    const batch = db.batch();
    for (const reward of DEFAULT_REWARDS) {
      const ref = rewardsRef.doc(reward.key);
      batch.create(ref, { ...reward, rewardId: reward.key, merchantId, status: "active", createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
    }
    await batch.commit();
  }
  return programRef;
}
async function listLoyaltyData(db, merchantId) {
  await ensureLoyaltyProgram(db, merchantId);
  const [customersSnapshot, rewardsSnapshot, programSnapshot] = await Promise.all([
    db.collection("merchants/" + merchantId + "/customers").where("status", "==", "active").orderBy("createdAt", "desc").get(),
    db.collection("merchants/" + merchantId + "/rewards").where("status", "==", "active").orderBy("createdAt", "asc").get(),
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
  await ref.create({ customerId: ref.id, merchantId, ...customer, points: 0, status: "active", createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
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
  await ref.create({ rewardId: ref.id, merchantId, ...reward, status: "active", createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
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
async function issuePoints(db, merchantId, customerId, points) {
  const id = requiredString(customerId, "customerId", 1, 128);
  const amount = validatePoints(points);
  const customerRef = db.doc("merchants/" + merchantId + "/customers/" + id);
  let result;
  await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(customerRef);
    if (!snapshot.exists || snapshot.data().status !== "active") throw new Error("Customer not found");
    const current = snapshot.data().points;
    if (!Number.isSafeInteger(current) || current < 0) throw new Error("Customer balance is invalid");
    const balanceAfter = current + amount;
    if (!Number.isSafeInteger(balanceAfter)) throw new Error("Point balance exceeds safe integer range");
    transaction.update(customerRef, { points: balanceAfter, updatedAt: FieldValue.serverTimestamp() });
    result = { customerId: id, pointsAdded: amount, balanceBefore: current, balanceAfter };
  });
  return result;
}
module.exports = { DEFAULT_REWARDS, normalizeCustomer, validatePoints, validateReward, ensureLoyaltyProgram, listLoyaltyData, createCustomer, updateCustomer, archiveCustomer, createReward, updateReward, issuePoints };