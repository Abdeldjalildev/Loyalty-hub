const { FieldValue } = require("firebase-admin/firestore");

function assertDisplayName(displayName) {
  if (typeof displayName !== "string") throw new Error("displayName must be a string");
  const normalized = displayName.trim();
  if (normalized.length < 2 || normalized.length > 80) {
    throw new Error("displayName must contain 2-80 characters");
  }
  return normalized;
}

async function ensureMerchantTenant({ db, uid, email, displayName }) {
  if (!uid || typeof uid !== "string") throw new Error("uid is required");
  const normalizedName = assertDisplayName(displayName);
  const userRef = db.doc(`merchantUsers/${uid}`);
  const userSnapshot = await userRef.get();

  if (userSnapshot.exists) {
    const existing = userSnapshot.data();
    const merchantSnapshot = await db.doc(`merchants/${existing.merchantId}`).get();
    if (!merchantSnapshot.exists) throw new Error("Merchant mapping points to a missing tenant");
    return { merchantId: existing.merchantId, ...merchantSnapshot.data() };
  }

  const merchantId = db.collection("merchants").doc().id;
  const merchantRef = db.doc(`merchants/${merchantId}`);
  const now = FieldValue.serverTimestamp();

  await db.runTransaction(async (transaction) => {
    const current = await transaction.get(userRef);
    if (current.exists) return;

    transaction.create(merchantRef, {
      merchantId, name: normalizedName, ownerUid: uid,
      ownerEmail: typeof email === "string" ? email.trim().toLowerCase() : null,
      status: "active", createdAt: now, updatedAt: now,
    });
    transaction.create(userRef, {
      authUid: uid, merchantId, role: "owner", status: "active",
      createdAt: now, updatedAt: now,
    });
  });

  const finalMapping = await userRef.get();
  const finalMerchant = await db.doc(`merchants/${finalMapping.data().merchantId}`).get();
  return { merchantId: finalMapping.data().merchantId, ...finalMerchant.data() };
}

module.exports = { ensureMerchantTenant };
