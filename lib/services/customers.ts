import {
  addFirestoreDoc,
  updateFirestoreDoc,
  deleteFirestoreDoc,
} from '@/lib/hooks/useFirestore';

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
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Add a new customer to Firestore
 */
export async function addCustomer(customer: Omit<Customer, 'id'>) {
  try {
    const docId = await addFirestoreDoc('customers', customer);
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
    await updateFirestoreDoc('customers', customerId, updates);
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
