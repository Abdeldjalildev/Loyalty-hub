const { onCall } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const { getApps, initializeApp } = require("firebase-admin/app");

setGlobalOptions({ region: "us-central1", maxInstances: 10 });
if (getApps().length === 0) initializeApp();

exports.healthCheck = onCall((request) => ({
  ok: true,
  authenticated: request.auth != null,
}));
