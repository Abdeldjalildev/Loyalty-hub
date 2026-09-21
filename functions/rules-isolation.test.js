const test = require("node:test");
const assert = require("node:assert/strict");
const PROJECT_ID = process.env.GCLOUD_PROJECT || "loyal-hub-project";
const FIRESTORE_HOST = process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8080";
const AUTH_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST || "127.0.0.1:9099";

async function authUser(email, password) {
  const response = await fetch(
    `http://${AUTH_HOST}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=phase2-test-key`,
    { method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }) }
  );
  const body = await response.json();
  assert.equal(response.ok, true, JSON.stringify(body));
  return body;
}
async function firestoreGet(path, idToken) {
  const response = await fetch(
    `http://${FIRESTORE_HOST}/v1/projects/${PROJECT_ID}/databases/(default)/documents/${path}`,
    { headers: { authorization: `Bearer ${idToken}` } }
  );
  return { status: response.status, body: await response.json() };
}
async function firestoreWrite(path, idToken, fields) {
  const response = await fetch(
    `http://${FIRESTORE_HOST}/v1/projects/${PROJECT_ID}/databases/(default)/documents/${path}`,
    { method: "PATCH", headers: { authorization: `Bearer ${idToken}`, "content-type": "application/json" },
      body: JSON.stringify({ fields }) }
  );
  return { status: response.status, body: await response.json() };
}
test("merchant identity and tenant isolation deny cross-merchant access", async () => {
  const suffix = Date.now();
  const ownerA = await authUser(`owner-a-${suffix}@example.test`, "Password123!");
  const ownerB = await authUser(`owner-b-${suffix}@example.test`, "Password123!");
  const admin = require("firebase-admin");
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT_ID });
  const db = admin.firestore();
  const merchantA = `merchant-a-${suffix}`;
  const merchantB = `merchant-b-${suffix}`;
  await db.doc(`merchantUsers/${ownerA.localId}`).set({ authUid: ownerA.localId, merchantId: merchantA, role: "owner", status: "active" });
  await db.doc(`merchantUsers/${ownerB.localId}`).set({ authUid: ownerB.localId, merchantId: merchantB, role: "owner", status: "active" });
  await db.doc(`merchants/${merchantA}`).set({ merchantId: merchantA, ownerUid: ownerA.localId, name: "Merchant A", status: "active" });
  await db.doc(`merchants/${merchantB}`).set({ merchantId: merchantB, ownerUid: ownerB.localId, name: "Merchant B", status: "active" });
  await db.doc(`merchants/${merchantA}/customers/customer-a`).set({ name: "Customer A", merchantId: merchantA });
  assert.equal((await firestoreGet(`merchants/${merchantA}`, ownerA.idToken)).status, 200);
  assert.equal((await firestoreGet(`merchants/${merchantA}/customers/customer-a`, ownerA.idToken)).status, 200);
  assert.equal((await firestoreGet(`merchants/${merchantB}`, ownerA.idToken)).status, 403);
  assert.equal((await firestoreGet(`merchants/${merchantB}/customers/customer-b`, ownerA.idToken)).status, 403);
  assert.equal((await firestoreWrite(`merchants/${merchantB}/customers/attacker`, ownerA.idToken, { name: { stringValue: "forbidden" } })).status, 403);
  await db.recursiveDelete(db.doc(`merchants/${merchantA}`));
  await db.recursiveDelete(db.doc(`merchants/${merchantB}`));
  await db.doc(`merchantUsers/${ownerA.localId}`).delete();
  await db.doc(`merchantUsers/${ownerB.localId}`).delete();
});
