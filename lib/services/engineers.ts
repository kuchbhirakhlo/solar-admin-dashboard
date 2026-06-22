import {
  addFirestoreDoc,
  updateFirestoreDoc,
} from '@/lib/hooks/useFirestore';
import { addUser } from './users';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Engineer {
  id?: string;
  name: string;
  email: string;
  phone: string;
  role: 'engineer';
  status: 'active' | 'inactive' | 'suspended';
  certification?: string;
  licenseNumber?: string;
  licenseExpiration?: string;
  residentialWork?: boolean;
  commercialWork?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface InstallationRecord {
  id?: string;
  customerPhone: string;
  customerName: string;
  customerId?: string;
  engineerId: string;
  engineerName: string;
  inverterSerialNumber: string;
  solarPanelSerialNumbers: string[];
  acWireUsed: string;
  dcWireUsed: string;
  earthingWireUsed: string;
  notes?: string;
  installationDate: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Add a new engineer - creates Firebase Auth account + Firestore user record
 */
export async function addEngineer(
  engineer: {
    name: string;
    email: string;
    phone: string;
    password: string;
    certification?: string;
    licenseNumber?: string;
    licenseExpiration?: string;
    residentialWork?: boolean;
    commercialWork?: boolean;
  }
) {
  try {
    // 1. Create Firebase Auth account
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      engineer.email,
      engineer.password
    );
    const firebaseUser = userCredential.user;

    // 2. Create user record in Firestore 'users' collection
    const userData = {
      name: engineer.name,
      email: engineer.email,
      phone: engineer.phone,
      role: 'engineer' as const,
      status: 'active' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Store in users collection with the Firebase Auth UID as the document ID
    const { doc: firestoreDoc, setDoc } = await import('firebase/firestore');
    const userDocRef = firestoreDoc(db, 'users', firebaseUser.uid);
    await setDoc(userDocRef, userData);

    // 3. Create engineer-specific record in 'engineers' collection
    const engineerData = {
      uid: firebaseUser.uid,
      name: engineer.name,
      email: engineer.email,
      phone: engineer.phone,
      role: 'engineer',
      status: 'active',
      certification: engineer.certification || '',
      licenseNumber: engineer.licenseNumber || '',
      licenseExpiration: engineer.licenseExpiration || '',
      residentialWork: engineer.residentialWork || false,
      commercialWork: engineer.commercialWork || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const engineerId = await addFirestoreDoc('engineers', engineerData);
    return { engineerId, uid: firebaseUser.uid };
  } catch (error) {
    throw new Error(
      `Failed to add engineer: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Find customer by phone number
 */
export interface CustomerSearchResult {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  systemSize?: number;
  installationDate?: string;
  status?: string;
  [key: string]: any;
}

export async function findCustomerByPhone(phone: string) {
  try {
    const customersRef = collection(db, 'customers');
    const q = query(customersRef, where('phone', '==', phone));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    const data = doc.data() as Record<string, any>;
    return {
      id: doc.id,
      ...data,
    } as CustomerSearchResult;
  } catch (error) {
    throw new Error(
      `Failed to find customer: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Save installation record
 */
export async function saveInstallation(installation: Omit<InstallationRecord, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const data = {
      ...installation,
      installationDate: installation.installationDate || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docId = await addFirestoreDoc('installations', data);
    return docId;
  } catch (error) {
    throw new Error(
      `Failed to save installation: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Get installation records by engineer ID
 */
export async function getInstallationsByEngineer(engineerId: string) {
  try {
    const installationsRef = collection(db, 'installations');
    const q = query(
      installationsRef,
      where('engineerId', '==', engineerId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as InstallationRecord[];
  } catch (error) {
    throw new Error(
      `Failed to get installations: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Get engineer by UID
 */
export async function getEngineerByUid(uid: string) {
  try {
    const docRef = doc(db, 'engineers', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Engineer;
    }

    // Fallback: search by uid field
    const engineersRef = collection(db, 'engineers');
    const q = query(engineersRef, where('uid', '==', uid));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as Engineer;
    }

    return null;
  } catch (error) {
    throw new Error(
      `Failed to get engineer: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}