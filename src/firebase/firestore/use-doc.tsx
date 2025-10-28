
'use client';

import { useEffect, useState, useRef } from 'react';
import type {
  DocumentReference,
  DocumentData,
  FirestoreError,
  DocumentSnapshot,
} from 'firebase/firestore';
import { onSnapshot } from 'firebase/firestore';

function areRefsEqual(r1: DocumentReference | null, r2: DocumentReference | null): boolean {
    if (!r1 || !r2) return r1 === r2;
    return r1.path === r2.path;
}

export function useDoc<T extends DocumentData>(
  ref: DocumentReference<T> | null
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<FirestoreError | null>(null);
  
  const refRef = useRef(ref);

  useEffect(() => {
    if (areRefsEqual(ref, refRef.current)) {
        return;
    }
    refRef.current = ref;

    if (!ref) {
        setData(null);
        setLoading(false);
        setError(null);
        return;
    }

    setLoading(true);
    const unsubscribe = onSnapshot(
      ref,
      (snapshot: DocumentSnapshot<T>) => {
        if (snapshot.exists()) {
          setData({ ...snapshot.data(), id: snapshot.id });
        } else {
          setData(null);
        }
        setLoading(false);
        setError(null);
      },
      (err: FirestoreError) => {
        console.error("Error fetching document:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [ref]);

  return { data, loading, error };
}
