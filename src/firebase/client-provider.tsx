
'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { initializeFirebase, FirebaseProvider } from '@/firebase';
import { type FirebaseApp } from 'firebase/app';
import { type Auth } from 'firebase/auth';
import { type Firestore } from 'firebase/firestore';

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  // The state now holds the entire object returned by initializeFirebase
  const [firebase, setFirebase] = useState<{
    app: FirebaseApp | null;
    auth: Auth | null;
    firestore: Firestore | null;
  }>({ app: null, auth: null, firestore: null });

  useEffect(() => {
    // This ensures that Firebase is initialized only on the client side.
    // It now calls the single, centralized function.
    const { app, auth, firestore } = initializeFirebase();
    setFirebase({ app, auth, firestore });
  }, []);

  // The provider receives the initialized instances.
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
