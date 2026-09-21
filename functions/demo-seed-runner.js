const { getApps, initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { seedDemoTenant } = require('./demo-seed');

if (getApps().length === 0) initializeApp();
seedDemoTenant(getFirestore())
  .then(result => { console.log('Demo tenant seeded:', result); })
  .catch(error => { console.error('Demo tenant seed failed:', error); process.exitCode = 1; });
