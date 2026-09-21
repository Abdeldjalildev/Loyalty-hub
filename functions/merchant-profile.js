const { FieldValue } = require("firebase-admin/firestore");

function boundedString(value, field, min, max) {
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
function hexColor(value, field) {
  const normalized = boundedString(value, field, 4, 9);
  if (!/^#[0-9A-Fa-f]{6}$/.test(normalized)) throw new Error(field + " must be a 6-digit hex color");
  return normalized.toLowerCase();
}
function normalizeProfile(input) {
  return {
    name: boundedString(input?.name, "name", 2, 80),
    phone: optionalString(input?.phone, "phone", 32),
    address: optionalString(input?.address, "address", 240),
    website: optionalString(input?.website, "website", 2048),
  };
}
function normalizeBranding(input) {
  return {
    primaryColor: hexColor(input?.primaryColor || "#4f46e5", "primaryColor"),
    accentColor: hexColor(input?.accentColor || "#06b6d4", "accentColor"),
    logoUrl: optionalString(input?.logoUrl, "logoUrl", 2048),
  };
}
async function updateMerchantProfile({ db, merchantId, input }) {
  const profile = normalizeProfile(input);
  const ref = db.doc("merchants/" + merchantId);
  const snapshot = await ref.get();
  if (!snapshot.exists || snapshot.data().status !== "active") throw new Error("Merchant tenant is not active");
  await ref.update({ ...profile, updatedAt: FieldValue.serverTimestamp() });
  return { merchantId, ...snapshot.data(), ...profile };
}
async function updateMerchantBranding({ db, merchantId, input }) {
  const branding = normalizeBranding(input);
  const ref = db.doc("merchants/" + merchantId);
  const snapshot = await ref.get();
  if (!snapshot.exists || snapshot.data().status !== "active") throw new Error("Merchant tenant is not active");
  await ref.update({ branding, updatedAt: FieldValue.serverTimestamp() });
  return { merchantId, branding };
}
module.exports = { normalizeProfile, normalizeBranding, updateMerchantProfile, updateMerchantBranding };
