
'use client'; // Add 'use client' as this file now contains client-side logic.

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { initializeAppCheck, ReCaptchaV3Provider, type AppCheck } from 'firebase/app-check';
import { firebaseConfig } from './config';

// Providers and hooks
export { FirebaseProvider, useFirebaseApp, useAuth, useFirestore } from './provider';
export { FirebaseClientProvider } from './client-provider';
export { useUser } from './auth/use-user';
export { useCollection } from './firestore/use-collection';
export { useDoc } from './firestore/use-doc';

// This structure will hold the initialized instances.
let firebaseInstances: {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
  appCheck?: AppCheck;
} | null = null;

// This is the single, centralized initialization function.
export function initializeFirebase() {
  if (firebaseInstances) {
    return firebaseInstances;
  }

  if (getApps().length > 0) {
    const app = getApps()[0];
    const auth = getAuth(app);
    const firestore = getFirestore(app);
    firebaseInstances = { app, auth, firestore };
    return firebaseInstances;
  }

  // Check for valid config before initializing
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey.startsWith("REPLACE_WITH")) {
    console.error("Firebase config is not set. Please update src/firebase/config.ts");
    // Return a dummy object to prevent app crash, but services will not work.
    return {
      app: {} as FirebaseApp,
      auth: {} as Auth,
      firestore: {} as Firestore,
    };
  }

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const firestore = getFirestore(app);

  let appCheck: AppCheck | undefined;
  if (typeof window !== 'undefined') {
    // Ensure you have the site key in your environment variables
    const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    if (recaptchaSiteKey) {
        appCheck = initializeAppCheck(app, {
          provider: new ReCaptchaV3Provider(recaptchaSiteKey),
          isTokenAutoRefreshEnabled: true,
        });
    } else {
        console.warn("reCAPTCHA site key not found. App Check will not be initialized.");
    }
  }

  firebaseInstances = { app, auth, firestore, appCheck };
  return firebaseInstances;
}

// These are now simple getters that call the main initializer.
export const getFirebaseApp = () => initializeFirebase().app;
export const getAuthInstance = () => initializeFirebase().auth;
export const getFirestoreInstance = () => initializeFirebase().firestore;
