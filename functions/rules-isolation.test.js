const test = require("node:test");
const assert = require("node:assert/strict");
const PROJECT_ID = process.env.GCLOUD_PROJECT || "loyal-hub-project";
const FIRESTORE_HOST = process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8080";
const AUTH_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST || "127.0.0.1:9099";

async function authUser(email, password) {
  const response = await fetch(
    "http://" + AUTH_HOST + "/identitytoolkit.googleapis.com/v1/accounts:signUp?key=phase3-test-key",
    { method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }) }
  );
  const body = await response.json();
  assert.equal(response.ok, true, JSON.stringify(body));
  return body;
}

async function firestoreGet(path, idToken) {
  const response = await fetch(
    "http://" + FIRESTORE_HOST + "/v1/projects/" + PROJECT_ID + "/databases/(default)/documents/" + path,
    { headers: { authorization: "Bearer " + idToken } }
  );
  return { status: response.status, body: await response.json() };
}

async function firestoreWrite(path, idToken, fields) {
  const response = await fetch(
    "http://" + FIRESTORE_HOST + "/v1/projects/" + PROJECT_ID + "/databases/(default)/documents/" + path,
    { method: "PATCH", headers: { authorization: "Bearer " + idToken, "content-type": "application/json" },
      body: JSON.stringify({ fields }) }
  );
  return { status: response.status, body: await response.json() };
}

test("authenticated clients cannot directly read or write merchant loyalty data", async () => {
  const suffix = Date.now();
  const owner = await authUser("owner-" + suffix + "@example.test", "Password123!");
  const admin = require("firebase-admin");
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT_ID });
  const db = admin.firestore();
  const merchantId = "rules-merchant-" + suffix;
  await db.doc("merchantUsers/" + owner.localId).set({ authUid: owner.localId, merchantId, role: "owner", status: "active" });
  await db.doc("merchants/" + merchantId).set({ merchantId, ownerUid: owner.localId, name: "Rules Merchant", status: "active" });
  await db.doc("merchants/" + merchantId + "/customers/customer-a").set({ name: "Customer A", merchantId, points: 0, status: "active" });

  assert.equal((await firestoreGet("merchantUsers/" + owner.localId, owner.idToken)).status, 200);
  assert.equal((await firestoreGet("merchants/" + merchantId, owner.idToken)).status, 403);
  assert.equal((await firestoreGet("merchants/" + merchantId + "/customers/customer-a", owner.idToken)).status, 403);
  assert.equal((await firestoreWrite("merchants/" + merchantId + "/customers/attacker", owner.idToken, { name: { stringValue: "forbidden" } })).status, 403);

  await db.recursiveDelete(db.doc("merchants/" + merchantId));
  await db.doc("merchantUsers/" + owner.localId).delete();
});
