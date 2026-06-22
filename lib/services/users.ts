export interface User {
  id?: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'agent' | 'engineer' | 'customer';
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