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
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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
 * The employee can then login with their email and the password set by admin.
 */
export async function addEmployee(employee: {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'engineer' | 'registrar' | 'agent' | 'partner';
  status: 'active' | 'inactive' | 'suspended';
}) {
  // Pre-check if email already exists in Firestore
  const emailExists = await checkEmailExists(employee.email);
  if (emailExists) {
    throw new Error(
      `An employee with email "${employee.email}" already exists. ` +
      `Please modify the email address to make it unique (e.g., add a suffix like "${employee.email.replace('@', '-2@')}").`
    );
  }

  try {
    // 1. Create Firebase Auth account with email and password
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      employee.email,
      employee.password
    );
    const firebaseUser = userCredential.user;

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

    const userDocRef = doc(db, 'users', firebaseUser.uid);
    await setDoc(userDocRef, userData);

    // 3. If role is engineer, also create entry in 'engineers' collection
    if (employee.role === 'engineer') {
      const engineerData = {
        uid: firebaseUser.uid,
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        role: 'engineer',
        status: employee.status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await addFirestoreDoc('engineers', engineerData);
    }

    // 4. If role is agent/partner, also create entry in 'Partner' collection
    if (employee.role === 'agent' || employee.role === 'partner') {
      const partnerData = {
        uid: firebaseUser.uid,
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        role: employee.role === 'agent' ? 'partner' : 'partner',
        status: employee.status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await addFirestoreDoc('Partner', partnerData);
    }

    return { uid: firebaseUser.uid };
  } catch (error) {
    // Improve error messages for common Firebase Auth errors
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    if (message.includes('auth/email-already-in-use')) {
      throw new Error(
        `Email "${employee.email}" is already registered in the system. ` +
        `Please modify the email address (e.g., change the name suffix) to make it unique.`
      );
    }
    
    throw new Error(`Failed to create employee: ${message}`);
  }
}
