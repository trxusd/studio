
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

// This is a kludge to support HMR
function initialize(): { firebaseApp: FirebaseApp; auth: Auth; firestore: Firestore } {
  if (getApps().length === 0) {
    if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "REPLACE_WITH_YOUR_API_KEY") {
      console.error("Firebase config is not set. Please update src/firebase/config.ts");
    }
    firebaseApp = initializeApp(firebaseConfig);
    auth = getAuth(firebaseApp);
    firestore = getFirestore(firebaseApp);
  }
  return { firebaseApp, auth, firestore };
}

const { 
  firebaseApp: _getFirebaseApp, 
  auth: _getAuthInstance, 
  firestore: _getFirestoreInstance 
} = initialize();

export const getFirebaseApp = _getFirebaseApp;
export const getAuthInstance = _getAuthInstance;
export const getFirestoreInstance = _getFirestoreInstance;
