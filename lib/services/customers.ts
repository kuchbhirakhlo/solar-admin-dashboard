import {
  addFirestoreDoc,
  updateFirestoreDoc,
  deleteFirestoreDoc,
} from '@/lib/hooks/useFirestore';
import { addUser } from './users';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export interface Customer {
  id?: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  systemSize: number;
  installationDate: string;
  status: 'active' | 'pending' | 'inactive';
  monthlyUsage: number;
  location?: string;
  totalSpent?: number;
  createdAt?: string;
  updatedAt?: string;
  alternatePhone?: string;
  connectionNumber?: string;
  projectStatus?: 'registration' | 'upload_agreement' | 'installation' | 'project_commissioning' | 'discom_approval' | 'completed';
  documents?: {
    aadhaarFront?: string;
    aadhaarBack?: string;
    panCard?: string;
    bankPassbook?: string;
    cancelledCheque?: string;
    electricityBill?: string;
    propertyDocuments?: string;
    rooftopPhotos?: string;
    gpsPhoto?: string;
    ownershipDocument?: string;
  };
}

/**
 * Get customer status by customer ID from Firestore
 * Fetches only the status field for efficiency
 */
export async function getCustomerStatus(customerId: string): Promise<'active' | 'pending' | 'inactive' | null> {
  try {
    const docRef = doc(db, 'customers', customerId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    return (data.status as 'active' | 'pending' | 'inactive') || null;
  } catch (error) {
    console.error('Failed to get customer status:', error);
    throw new Error(`Failed to get customer status: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Add a new customer to Firestore and create a user account
 */
export async function addCustomer(customer: Omit<Customer, 'id'>) {
  try {
    const cleanedData: Record<string, unknown> = {};
    
    for (const [key, value] of Object.entries(customer)) {
      if (value !== undefined && value !== null && value !== '') {
        if (typeof value === 'object' && !Array.isArray(value)) {
          const nestedCleaned: Record<string, unknown> = {};
          for (const [nestedKey, nestedValue] of Object.entries(value)) {
            if (nestedValue !== undefined && nestedValue !== null && nestedValue !== '') {
              nestedCleaned[nestedKey] = nestedValue;
            }
          }
          if (Object.keys(nestedCleaned).length > 0) {
            cleanedData[key] = nestedCleaned;
          }
        } else {
          cleanedData[key] = value;
        }
      }
    }

    const customerData = {
      ...cleanedData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docId = await addFirestoreDoc('customers', customerData);

    await addUser({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      city: customer.city,
      state: customer.state,
      zipCode: customer.zipCode,
      role: 'customer',
      status: 'active',
      customerId: docId,
      createdAt: customerData.createdAt,
      updatedAt: customerData.updatedAt,
    });

    return docId;
  } catch (error) {
    throw new Error(`Failed to add customer: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Update an existing customer
 */
export async function updateCustomer(customerId: string, updates: Partial<Customer>) {
  try {
    await updateFirestoreDoc('customers', customerId, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    throw new Error(`Failed to update customer: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete a customer
 */
export async function deleteCustomer(customerId: string) {
  try {
    await deleteFirestoreDoc('customers', customerId);
  } catch (error) {
    throw new Error(`Failed to delete customer: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get customer by ID (use hook in components)
 * Example: const { data: customer } = useFirestoreDoc<Customer>('customers', customerId);
 */

/**
 * Get all customers (use hook in components)
 * Example: const { data: customers } = useFirestoreCollection<Customer>('customers');
 */

/**
 * Get customers by status (use hook with constraints)
 * Example:
 * const { data: activeCustomers } = useFirestoreCollection<Customer>(
 *   'customers',
 *   [where('status', '==', 'active')]
 * );
 */