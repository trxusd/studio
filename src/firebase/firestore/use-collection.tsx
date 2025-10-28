
'use client';

import { useEffect, useState } from 'react';
import type {
  Query,
  DocumentData,
  FirestoreError,
  QuerySnapshot,
} from 'firebase/firestore';
import { onSnapshot, queryEqual, where, orderBy, limit, startAt, endAt } from 'firebase/firestore';

// Helper function to create a stable string representation of a query
const getQueryId = (q: Query): string => {
  const anemicQuery = (q as any)._query;
  if (!anemicQuery) return 'invalid-query';
  
  const parts: string[] = [anemicQuery.path];
  
  anemicQuery.explicitOrderBy.forEach((o: any) => parts.push(`orderBy:${o.field},${o.dir}`));
  anemicQuery.filters.forEach((f: any) => parts.push(`where:${f.field},${f.op},${f.value}`));
  if (anemicQuery.limit !== null) parts.push(`limit:${anemicQuery.limit}`);
  if (anemicQuery.startAt) parts.push(`startAt:${JSON.stringify(anemicQuery.startAt.value)}`);
  if (anemicQuery.endAt) parts.push(`endAt:${JSON.stringify(anemicQuery.endAt.value)}`);
  
  return parts.join('|');
};


export function useCollection<T extends DocumentData>(
  query: Query<T> | null
) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  const queryId = query ? getQueryId(query) : null;

  useEffect(() => {
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
        setData(null);
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [queryId]); // Using the stable queryId as the dependency

  return { data, loading, error };
}
