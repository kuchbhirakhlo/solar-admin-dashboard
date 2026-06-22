'use client';

import { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  setDoc,
  query,
  where,
  QueryConstraint,
  Timestamp,
  onSnapshot,
  Unsubscribe,
  Query,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface UseFirestoreOptions {
  collectionName: string;
  docId?: string;
  queries?: QueryConstraint[];
}

interface UseFirestoreResult<T> {
  data: T | T[] | null;
  loading: boolean;
  error: string | null;
}

export function useFirestoreCollection<T extends { id?: string }>(
  collectionName: string,
  constraints?: QueryConstraint[]
): UseFirestoreResult<T> {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(collection(db, collectionName), ...(constraints || []));
        const snapshot = await getDocs(q);
        const items = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })) as T[];
        setData(items);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [collectionName, constraints]);

  return { data, loading, error };
}

export function useFirestoreDoc<T extends { id?: string }>(
  collectionName: string,
  docId: string
): UseFirestoreResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, collectionName, docId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setData({
            ...docSnap.data(),
            id: docSnap.id,
          } as T);
        } else {
          setError('Document not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch document');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [collectionName, docId]);

  return { data, loading, error };
}

export async function addFirestoreDoc<T extends Record<string, any>>(
  collectionName: string,
  data: T
) {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to add document');
  }
}

export async function addFirestoreDocWithAutoId<T extends Record<string, any>>(
  collectionName: string,
  data: T
) {
  try {
    const docRef = doc(collection(db, collectionName));
    await setDoc(docRef, {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to add document with auto ID');
  }
}

export async function updateFirestoreDoc<T extends Record<string, any>>(
  collectionName: string,
  docId: string,
  data: Partial<T>
) {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to update document');
  }
}

export async function deleteFirestoreDoc(collectionName: string, docId: string) {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to delete document');
  }
}

export function useFirestoreCollectionRealtime<T extends { id?: string }>(
  collectionName: string,
  constraints?: QueryConstraint[]
) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, collectionName), ...(constraints || []));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({
          ...(d.data() as T),
          id: d.id,
        }));
        setData(items);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err instanceof Error ? err.message : 'Realtime listener error');
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [collectionName, JSON.stringify(constraints)]);

  return { data, loading, error };
}

export function useFirestoreDocRealtime<T extends { id?: string }>(
  collectionName: string,
  docId: string
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const docRef = doc(db, collectionName, docId);

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setData({ ...(snapshot.data() as T), id: snapshot.id });
        } else {
          setError('Document not found');
          setData(null);
        }
        setLoading(false);
      },
      (err) => {
        setError(err instanceof Error ? err.message : 'Realtime listener error');
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [collectionName, docId]);

  return { data, loading, error };
}
