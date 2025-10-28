
'use client';

import { useEffect, useState, useRef } from 'react';
import type {
  Firestore,
  Query,
  DocumentData,
  FirestoreError,
  QuerySnapshot,
} from 'firebase/firestore';
import { onSnapshot } from 'firebase/firestore';

// Helper to compare queries
function areQueriesEqual(q1: Query | null, q2: Query | null): boolean {
    if (!q1 || !q2) return q1 === q2;
    // This is a simplified comparison. For more complex scenarios, you might need a more robust check.
    // However, for most cases, checking the path and stringified filters/orderBy should work.
    return q1.path === q2.path && JSON.stringify(q1) === JSON.stringify(q2);
}


export function useCollection<T extends DocumentData>(
  query: Query<T> | null
) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<FirestoreError | null>(null);
  
  const queryRef = useRef<Query<T> | null>(null);

  useEffect(() => {
    // Only re-run the effect if the query has actually changed.
    if (areQueriesEqual(query, queryRef.current)) {
        return;
    }
    queryRef.current = query;

    if (!query) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    
    const unsubscribe = onSnapshot(
      query,
      (snapshot: QuerySnapshot<T>) => {
        const docs = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setData(docs);
        setLoading(false);
        setError(null);
      },
      (err: FirestoreError) => {
        console.error("Error fetching collection:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [query]); // This effect now correctly depends on the query object.

  return { data, loading, error };
}
