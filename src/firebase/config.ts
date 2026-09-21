export const firebaseProjectId =
  import.meta.env.VITE_FIREBASE_PROJECT_ID || 'loyal-hub-project';

export const firebaseApiKey = import.meta.env.VITE_FIREBASE_API_KEY || '';

export const functionsOrigin =
  import.meta.env.VITE_FIREBASE_FUNCTIONS_ORIGIN ||
  `https://us-central1-${firebaseProjectId}.cloudfunctions.net`;

export function assertFirebaseConfiguration() {
  if (firebaseProjectId !== 'loyal-hub-project') {
    throw new Error(
      `LoyaltyHub is configured for project "loyal-hub-project", not "${firebaseProjectId}".`,
    );
  }
  if (!firebaseApiKey) {
    throw new Error(
      'VITE_FIREBASE_API_KEY is missing. Add the Firebase Web API key to the environment.',
    );
  }
}
