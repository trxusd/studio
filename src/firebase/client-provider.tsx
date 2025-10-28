
'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { getFirebaseApp, getAuthInstance, getFirestoreInstance, FirebaseProvider } from '@/firebase';
import { type FirebaseApp } from 'firebase/app';
import { type Auth } from 'firebase/auth';
import { type Firestore } from 'firebase/firestore';

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  // We initialize the state with null, and they will be populated on the client side.
  const [firebase, setFirebase] = useState<{
    app: FirebaseApp | null;
    auth: Auth | null;
    firestore: Firestore | null;
  }>({ app: null, auth: null, firestore: null });

  useEffect(() => {
    // This ensures that Firebase is initialized only on the client side.
    const app = getFirebaseApp();
    const auth = getAuthInstance();
    const firestore = getFirestoreInstance();
    setFirebase({ app, auth, firestore });
  }, []);

  // We always render the provider, but the context values will be null until
  // the useEffect runs on the client. Hooks like useAuth will handle this null value gracefully.
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
