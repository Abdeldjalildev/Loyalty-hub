const { FieldValue } = require("firebase-admin/firestore");

function normalizeEmail(email) {
  if (typeof email !== "string") throw new Error("email must be a string");
  const value = email.trim().toLowerCase();
  if (!value || value.length > 254) throw new Error("email is invalid");
  return value;
}

async function provisionCustomer({ db, uid, email, merchantId }) {
  if (!uid) throw new Error("uid is required");
  const normalizedEmail = normalizeEmail(email);
  if (typeof merchantId !== "string" || !merchantId.trim()) throw new Error("merchantId is required");
  const tenantId = merchantId.trim();

  const customerUserRef = db.doc("customerUsers/" + uid);
  const existingMapping = await customerUserRef.get();
  if (existingMapping.exists) {
    const data = existingMapping.data();
    if (data.merchantId !== tenantId) throw new Error("Customer account is already linked to another merchant");
    const customerRef = db.doc("merchants/" + tenantId + "/customers/" + data.customerId);
    const customer = await customerRef.get();
    if (!customer.exists || customer.data().status !== "active") throw new Error("Customer record is missing or inactive");
    if (customer.data().email !== normalizedEmail) throw new Error("Customer email does not match account");
    return { merchantId: tenantId, customerId: data.customerId, customer: customer.data() };
  }

  const customerSnapshot = await db.collection("merchants/" + tenantId + "/customers")
    .where("email", "==", normalizedEmail).where("status", "==", "active").limit(2).get();
  if (customerSnapshot.empty) throw new Error("No active customer record matches this email for the selected merchant");
  if (customerSnapshot.size > 1) throw new Error("Multiple customer records match this email; merchant cleanup is required");

  const customerDoc = customerSnapshot.docs[0];
  const linkedAccount = await db.collection("customerUsers").where("customerId", "==", customerDoc.id).limit(1).get();
  if (!linkedAccount.empty) throw new Error("This customer already has a portal account");

  await customerUserRef.create({
    authUid: uid,
    merchantId: tenantId,
    customerId: customerDoc.id,
    email: normalizedEmail,
    role: "customer",
    status: "active",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return { merchantId: tenantId, customerId: customerDoc.id, customer: customerDoc.data() };
}

async function getCustomerContext({ db, uid, email }) {
  const mapping = await db.doc("customerUsers/" + uid).get();
  if (!mapping.exists) throw new Error("Customer portal account is not provisioned");
  const data = mapping.data();
  if (data.status !== "active" || data.role !== "customer") throw new Error("Customer portal access is inactive");
  const customer = await db.doc("merchants/" + data.merchantId + "/customers/" + data.customerId).get();
  if (!customer.exists || customer.data().status !== "active") throw new Error("Customer record is missing or inactive");
  if (customer.data().email !== String(email || "").trim().toLowerCase()) throw new Error("Customer email does not match account");
  return { merchantId: data.merchantId, customerId: data.customerId, customer: customer.data() };
}

module.exports = { provisionCustomer, getCustomerContext };