export interface User {
  id?: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'agent' | 'engineer' | 'registrar' | 'customer' | 'partner';
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin?: Date;
  createdAt?: string;
  updatedAt?: string;
  customerId?: string;
}

import {
  addFirestoreDoc,
  updateFirestoreDoc,
} from '@/lib/hooks/useFirestore';
import { collection, doc, writeBatch } from 'firebase/firestore';
import { withEmployeeAccount } from './employeeAuth';
import { auth, db } from '@/lib/firebase';

export async function addUser(user: Omit<User, 'id'>) {
  try {
    const userData = {
      ...user,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const docId = await addFirestoreDoc('users', userData);
    return docId;
  } catch (error) {
    throw new Error(`Failed to add user: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Check if an email is already in use in Firebase Auth by querying Firestore users collection.
 * Note: We can't directly query Firebase Auth, so we check the Firestore users collection
 * as a proxy. Firebase Auth will also validate uniqueness server-side.
 */
async function checkEmailExists(email: string): Promise<boolean> {
  try {
    const { collection, query, where, getDocs } = await import('firebase/firestore');
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch {
    // If this check fails, we still try the create below - Firebase Auth will be the final authority
    return false;
  }
}

/**
 * Create a new employee account (engineer, registrar, or partner).
 * This creates both a Firebase Auth account (for login) and a Firestore user record.
 * Partners use phone OTP; other employees use email and the password set by admin.
 */
export async function addEmployee(employee: {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'engineer' | 'registrar' | 'agent' | 'partner';
  status: 'active' | 'inactive' | 'suspended';
}) {
  if (employee.role === 'agent' || employee.role === 'partner') {
    await auth.authStateReady();
    if (!auth.currentUser) throw new Error('Sign in as an administrator before creating partners.');
    const token = await auth.currentUser.getIdToken();
    const response = await fetch('/api/partners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        name: employee.name, email: employee.email, phone: employee.phone,
        role: employee.role, status: employee.status,
      }),
    });
    let result;
    try {
      result = await response.json();
    } catch {
      throw new Error(`Partner service returned an invalid response (HTTP ${response.status}). Check the Vercel runtime logs and Firebase Admin configuration before retrying.`);
    }
    if (!result || typeof result !== 'object') {
      throw new Error('Partner service returned an invalid response. Check the Vercel runtime logs before retrying.');
    }
    if (!response.ok) throw new Error(result.error || 'Failed to create partner.');
    if (typeof result.uid !== 'string' || !result.uid) {
      throw new Error('Partner service did not confirm account creation. Check the account before retrying.');
    }
    return result as { uid: string };
  }

  // Pre-check if email already exists in Firestore
  const emailExists = await checkEmailExists(employee.email);
  if (emailExists) {
    throw new Error(
      `An account with email "${employee.email}" already exists. Use the existing account or the new employee's own email address.`
    );
  }

  try {
    return await withEmployeeAccount(
      employee.email,
      employee.password,
      async (uid) => {
        const batch = writeBatch(db);

        // 2. Create user record in Firestore 'users' collection
        //    Use the Firebase Auth UID as the document ID for role lookups
        const userData = {
          name: employee.name,
          email: employee.email,
          phone: employee.phone,
          role: employee.role,
          status: employee.status,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const userDocRef = doc(db, 'users', uid);
        batch.set(userDocRef, userData);

        // 3. If role is engineer, also create entry in 'engineers' collection
        if (employee.role === 'engineer') {
          const engineerData = {
            uid,
            name: employee.name,
            email: employee.email,
            phone: employee.phone,
            role: 'engineer',
            status: employee.status,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          batch.set(doc(collection(db, 'engineers')), engineerData);
        }

        await batch.commit();
        return { uid };
      }
    );
  } catch (error) {
    // Improve error messages for common Firebase Auth errors
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    if (message.includes('auth/email-already-in-use')) {
      throw new Error(
        `Email "${employee.email}" is already registered in Firebase Authentication. Use the existing account; a previous failed attempt may have created it without an employee profile.`
      );
    }
    
    throw new Error(`Failed to create employee: ${message}`);
  }
}
