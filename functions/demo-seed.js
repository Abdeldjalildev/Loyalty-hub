const { FieldValue } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');

const DEMO_MERCHANT_ID = 'demo-merchant';
const DEMO_CUSTOMER_ID = 'demo-customer-001';

const DEMO_REWARDS = [
  { id: 'demo-free-coffee', titleEn: 'Free Coffee', titleAr: 'قهوة مجانية', titleFr: 'Café Gratuit', pointsRequired: 50 },
  { id: 'demo-breakfast', titleEn: 'Free Breakfast', titleAr: 'فطور مجاني', titleFr: 'Petit Déjeuner Gratuit', pointsRequired: 150 },
  { id: 'demo-discount', titleEn: '10% Discount', titleAr: 'خصم 10%', titleFr: 'Réduction 10%', pointsRequired: 100 },
];

function buildDemoMerchant() {
  return {
    merchantId: DEMO_MERCHANT_ID,
    name: 'LoyaltyHub Demo Café',
    description: 'A ready-to-show demo loyalty program for client presentations.',
    phone: '+213 555 000 000',
    websiteUrl: 'https://example.com',
    instagramUrl: 'https://instagram.com/',
    facebookUrl: 'https://facebook.com/',
    whatsappUrl: 'https://wa.me/213555000000',
    logoUrl: '',
    branding: { primaryColor: '#4f46e5', secondaryColor: '#06b6d4', theme: 'light' },
    status: 'active',
    demo: true,
  };
}

async function ensureDemoAuthUser({ email, password, displayName }) {\n  if (!email || !password) throw new Error('DEMO_MERCHANT_EMAIL and DEMO_MERCHANT_PASSWORD are required');\n  const auth = getAuth();\n  let user;\n  try { user = await auth.getUserByEmail(email); }\n  catch (error) { if (error.code !== 'auth/user-not-found') throw error; user = await auth.createUser({ email, password, emailVerified: true, displayName }); }\n  if (!user.emailVerified) user = await auth.updateUser(user.uid, { emailVerified: true });\n  return user;\n}\n\nasync function seedDemoTenant(db) {
  const demoEmail = process.env.DEMO_MERCHANT_EMAIL;\n  const demoPassword = process.env.DEMO_MERCHANT_PASSWORD;\n  const owner = await ensureDemoAuthUser({ email: demoEmail, password: demoPassword, displayName: 'LoyaltyHub Demo Café' });\n  const merchantRef = db.doc('merchants/' + DEMO_MERCHANT_ID);
  const customerRef = db.doc('merchants/' + DEMO_MERCHANT_ID + '/customers/' + DEMO_CUSTOMER_ID);
  await merchantRef.set({
    ...buildDemoMerchant(),
    ownerUid: 'demo-seed-owner',
    ownerEmail: 'demo-owner@example.com',
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true });

  await db.doc('merchants/' + DEMO_MERCHANT_ID + '/loyaltyPrograms/default').set({
    programId: 'default',
    merchantId: DEMO_MERCHANT_ID,
    name: 'Demo Café Rewards',
    pointsPerUnit: 1,
    minimumRewardPoints: 1,
    maxPointsPerTransaction: 500,
    status: 'active',
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true });

  for (const reward of DEMO_REWARDS) {
    await db.doc('merchants/' + DEMO_MERCHANT_ID + '/rewards/' + reward.id).set({
      rewardId: reward.id, merchantId: DEMO_MERCHANT_ID, ...reward, status: 'active',
      createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
  }

  await db.doc('merchantUsers/' + owner.uid).set({ authUid: owner.uid, merchantId: DEMO_MERCHANT_ID, role: 'owner', status: 'active', createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() }, { merge: true });\n\n  await customerRef.set({
    customerId: DEMO_CUSTOMER_ID, merchantId: DEMO_MERCHANT_ID,
    name: 'Demo Customer', email: 'demo.customer@example.com', phone: '+213 555 111 111',
    points: 125, status: 'active', demo: true,
    createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true });

  return { merchantId: DEMO_MERCHANT_ID, customerId: DEMO_CUSTOMER_ID, ownerUid: owner.uid };
}

module.exports = { DEMO_MERCHANT_ID, DEMO_CUSTOMER_ID, DEMO_REWARDS, buildDemoMerchant, seedDemoTenant };
