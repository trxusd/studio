'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { getFirebaseApp, getAuthInstance, getFirestoreInstance, FirebaseProvider } from '@/firebase';
import { type FirebaseApp } from 'firebase/app';
import { type Auth } from 'firebase/auth';
import { type Firestore } from 'firebase/firestore';

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const [firebase, setFirebase] = useState<{
    app: FirebaseApp;
    auth: Auth;
    firestore: Firestore;
  } | null>(null);

  useEffect(() => {
    // This ensures that Firebase is initialized only on the client side.
    const app = getFirebaseApp();
    const auth = getAuthInstance();
    const firestore = getFirestoreInstance();
    setFirebase({ app, auth, firestore });
  }, []);

  if (!firebase) {
    // You can render a loader here if you want
    return null;
  }

  return (
    <FirebaseProvider
      app={firebase.app}
      auth={firebase.auth}
      firestore={firebase.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
