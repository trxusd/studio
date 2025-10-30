
'use client';

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

  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  const auth = getAuth(app);
  const firestore = getFirestore(app);
  let appCheck: AppCheck | undefined;

  // Conditionally initialize App Check only if the site key is available
  if (typeof window !== 'undefined') {
    const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    if (recaptchaSiteKey) {
      try {
        appCheck = initializeAppCheck(app, {
          provider: new ReCaptchaV3Provider(recaptchaSiteKey),
          isTokenAutoRefreshEnabled: true,
        });
        console.log("Firebase App Check initialized with reCAPTCHA.");
      } catch (e) {
        console.error("Failed to initialize Firebase App Check:", e);
      }
    } else {
      console.warn("NEXT_PUBLIC_RECAPTCHA_SITE_KEY is not set. Firebase App Check is disabled.");
    }
  }

  firebaseInstances = { app, auth, firestore, appCheck };
  return firebaseInstances;
}

// These are now simple getters that call the main initializer.
export const getFirebaseApp = () => initializeFirebase().app;
export const getAuthInstance = () => initializeFirebase().auth;
export const getFirestoreInstance = () => initializeFirebase().firestore;
