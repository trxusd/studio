'use client';

import { useMemo, type ReactNode } from 'react';
import { getFirebaseApp, getAuthInstance, getFirestoreInstance, FirebaseProvider } from '@/firebase';

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const { firebaseApp, auth, firestore } = useMemo(() => {
    const app = getFirebaseApp();
    const authInstance = getAuthInstance();
    const firestoreInstance = getFirestoreInstance();
    return { firebaseApp: app, auth: authInstance, firestore: firestoreInstance };
  }, []);

  return (
    <FirebaseProvider app={firebaseApp} auth={auth} firestore={firestore}>
      {children}
    </FirebaseProvider>
  );
}
