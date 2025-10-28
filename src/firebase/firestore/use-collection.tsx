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

export function useCollection<T extends DocumentData>(
  query: Query<T> | null
) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<FirestoreError | null>(null);
  
  // Using a ref to hold the query object. This helps prevent re-subscribing on every render.
  const queryRef = useRef(query);
  
  // This effect ensures that our ref is always up-to-date if the query prop changes.
  useEffect(() => {
    queryRef.current = query;
  }, [query]);

  useEffect(() => {
    // If the query is null, we should not proceed.
    if (!queryRef.current) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Set up the real-time listener.
    const unsubscribe = onSnapshot(
      queryRef.current,
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

    // The cleanup function will be called when the component unmounts.
    return () => unsubscribe();
  }, []); // Empty dependency array means this effect runs only once on mount.

  return { data, loading, error };
}
