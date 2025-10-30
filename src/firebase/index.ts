
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

// Providers and hooks
export { FirebaseProvider, useFirebaseApp, useAuth, useFirestore } from './provider';
export { FirebaseClientProvider } from './client-provider';
export { useUser } from './auth/use-user';
export { useCollection } from './firestore/use-collection';
export { useDoc } from './firestore/use-doc';

let firebaseApp: FirebaseApp;
let auth: Auth;
let firestore: Firestore;

// This function is the key to fixing the reCAPTCHA issue.
// It makes the reCAPTCHA config available globally for Firebase.
function initializeRecaptcha() {
    if (typeof window !== 'undefined') {
        (window as any).FIREBASE_APPCHECK_DEBUG_TOKEN = process.env.NODE_ENV === 'development';
        (window as any).self = window;
    }
}

function initialize() {
  initializeRecaptcha();

  if (getApps().length === 0) {
    if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "REPLACE_WITH_YOUR_API_KEY") {
      console.error("Firebase config is not set. Please update src/firebase/config.ts");
       // Return dummy objects or throw an error to prevent the app from crashing
       return {
         firebaseApp: {} as FirebaseApp,
         auth: {} as Auth,
         firestore: {} as Firestore
       };
    }
    firebaseApp = initializeApp(firebaseConfig);
  } else {
    firebaseApp = getApps()[0];
  }

  auth = getAuth(firebaseApp);
  firestore = getFirestore(firebaseApp);
  
  return { firebaseApp, auth, firestore };
}

const instances = initialize();

export const getFirebaseApp = () => instances.firebaseApp;
export const getAuthInstance = () => instances.auth;
export const getFirestoreInstance = () => instances.firestore;
