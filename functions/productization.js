const { FieldValue } = require("firebase-admin/firestore");

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
function optionalUrl(value, field) {
  const normalized = optionalString(value, field, 2048);
  if (!normalized) return "";
  let parsed;
  try { parsed = new URL(normalized); } catch { throw new Error(field + " must be a valid URL"); }
  if (!["http:", "https:"].includes(parsed.protocol)) throw new Error(field + " must use http or https");
  return parsed.toString();
}
function color(value, field) {
  const normalized = requiredString(value, field, 4, 7);
  if (!/^#[0-9A-Fa-f]{6}$/.test(normalized)) throw new Error(field + " must be a 6-digit hex color");
  return normalized.toLowerCase();
}
function normalizeProfile(input) {
  return {
    name: requiredString(input?.name, "name", 2, 80),
    description: optionalString(input?.description, "description", 500),
    phone: optionalString(input?.phone, "phone", 32),
    websiteUrl: optionalUrl(input?.websiteUrl, "websiteUrl"),
    instagramUrl: optionalUrl(input?.instagramUrl, "instagramUrl"),
    facebookUrl: optionalUrl(input?.facebookUrl, "facebookUrl"),
    whatsappUrl: optionalUrl(input?.whatsappUrl, "whatsappUrl"),
    logoUrl: optionalUrl(input?.logoUrl, "logoUrl"),
  };
}
function normalizeBranding(input) {
  const theme = input?.theme === "dark" || input?.theme === "light" ? input.theme : "light";
  return { primaryColor: color(input?.primaryColor, "primaryColor"), secondaryColor: color(input?.secondaryColor, "secondaryColor"), theme };
}
function normalizeLoyalty(input) {
  const pointsPerUnit = input?.pointsPerUnit;
  if (!Number.isSafeInteger(pointsPerUnit) || pointsPerUnit < 1 || pointsPerUnit > 1000) throw new Error("pointsPerUnit must be an integer from 1-1000");
  const minimumRewardPoints = input?.minimumRewardPoints;
  if (!Number.isSafeInteger(minimumRewardPoints) || minimumRewardPoints < 1 || minimumRewardPoints > 1000000) throw new Error("minimumRewardPoints must be an integer from 1-1000000");
  const maxPointsPerTransaction = input?.maxPointsPerTransaction;
  if (!Number.isSafeInteger(maxPointsPerTransaction) || maxPointsPerTransaction < 1 || maxPointsPerTransaction > 1000000) throw new Error("maxPointsPerTransaction must be an integer from 1-1000000");
  return { pointsPerUnit, minimumRewardPoints, maxPointsPerTransaction };
}
async function updateMerchantProfile({ db, merchantId, input }) {
  const merchantRef = db.doc("merchants/" + merchantId);
  const snapshot = await merchantRef.get();
  if (!snapshot.exists || snapshot.data().status !== "active") throw new Error("Merchant tenant is missing or inactive");
  const profile = normalizeProfile(input);
  await merchantRef.update({ ...profile, updatedAt: FieldValue.serverTimestamp() });
  return { ...snapshot.data(), ...profile, merchantId };
}
async function updateMerchantBranding({ db, merchantId, input }) {
  const merchantRef = db.doc("merchants/" + merchantId);
  const snapshot = await merchantRef.get();
  if (!snapshot.exists || snapshot.data().status !== "active") throw new Error("Merchant tenant is missing or inactive");
  const branding = normalizeBranding(input);
  await merchantRef.update({ branding, updatedAt: FieldValue.serverTimestamp() });
  return { ...snapshot.data(), branding, merchantId };
}
async function updateLoyaltyConfig({ db, merchantId, input }) {
  const programRef = db.doc("merchants/" + merchantId + "/loyaltyPrograms/default");
  const programSnapshot = await programRef.get();
  if (!programSnapshot.exists) throw new Error("Loyalty program is not initialized");
  const config = normalizeLoyalty(input);
  await programRef.update({ ...config, updatedAt: FieldValue.serverTimestamp() });
  return { id: programSnapshot.id, ...programSnapshot.data(), ...config };
}
async function getMerchantProductConfig({ db, merchantId }) {
  const merchantRef = db.doc("merchants/" + merchantId);
  const programRef = db.doc("merchants/" + merchantId + "/loyaltyPrograms/default");
  const [merchantSnapshot, programSnapshot] = await Promise.all([merchantRef.get(), programRef.get()]);
  if (!merchantSnapshot.exists || merchantSnapshot.data().status !== "active") throw new Error("Merchant tenant is missing or inactive");
  if (!programSnapshot.exists) throw new Error("Loyalty program is not initialized");
  return { merchant: { merchantId, ...merchantSnapshot.data() }, program: { id: programSnapshot.id, ...programSnapshot.data() } };
}
module.exports = { normalizeProfile, normalizeBranding, normalizeLoyalty, updateMerchantProfile, updateMerchantBranding, updateLoyaltyConfig, getMerchantProductConfig };
