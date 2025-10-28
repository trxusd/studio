'use client';

import { type ReactNode } from 'react';
import { getFirebaseApp, getAuthInstance, getFirestoreInstance, FirebaseProvider } from '@/firebase';

// Since initialization is now idempotent and handled in index.ts,
// we can simply call the getter functions directly.
const app = getFirebaseApp();
const auth = getAuthInstance();
const firestore = getFirestoreInstance();

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  // The useMemo hook is no longer necessary as initialization is handled globally.
  return (
    <FirebaseProvider app={app} auth={auth} firestore={firestore}>
      {children}
    </FirebaseProvider>
  );
}
