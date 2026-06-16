'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from './firebase';
import { User, onAuthStateChanged } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
});

export function FirebaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        try {
          setUser(currentUser);
          setLoading(false);
          setError(null);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Auth error occurred');
          setLoading(false);
        }
      },
      (error) => {
        setError(error.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useFirebaseAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useFirebaseAuth must be used within FirebaseAuthProvider');
  }
  return context;
}
