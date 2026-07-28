'use client';

import { useState, useEffect } from 'react';
import { doc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface UseCustomerStatusResult {
  status: 'active' | 'pending' | 'inactive' | null;
  loading: boolean;
  error: string | null;
}

/**
 * React hook to listen to a customer's status in real-time by customerId
 * Updates automatically when the status changes in Firestore
 */
export function useCustomerStatus(customerId: string | null | undefined): UseCustomerStatusResult {
  const [status, setStatus] = useState<'active' | 'pending' | 'inactive' | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!customerId) {
      setLoading(false);
      setError('No customer ID provided');
      return;
    }

    const docRef = doc(db, 'customers', customerId);

    const unsubscribe: Unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          const customerStatus = data.status as 'active' | 'pending' | 'inactive';
          setStatus(customerStatus || null);
          setError(null);
        } else {
          setStatus(null);
          setError('Customer not found');
        }
        setLoading(false);
      },
      (err) => {
        console.error('Failed to listen to customer status:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch customer status');
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [customerId]);

  return { status, loading, error };
}