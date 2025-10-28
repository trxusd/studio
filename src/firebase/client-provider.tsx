
'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { getFirebaseApp, getAuthInstance, getFirestoreInstance, FirebaseProvider } from '@/firebase';
import { type FirebaseApp } from 'firebase/app';
import { type Auth } from 'firebase/auth';
import { type Firestore } from 'firebase/firestore';

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  // We initialize the state with null, but we will always render children.
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

  // While firebase is initializing, we can still render the children.
  // The hooks like `useAuth` will simply not return an instance until initialization is complete.
  if (!firebase) {
    // Render children inside a dummy provider or just children directly.
    // This prevents the server/client mismatch.
    return <>{children}</>;
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
