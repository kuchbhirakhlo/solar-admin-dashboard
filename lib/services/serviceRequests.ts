import {
  addFirestoreDoc,
  updateFirestoreDoc,
  deleteFirestoreDoc,
} from '@/lib/hooks/useFirestore';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  doc,
  getDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface ServiceRequest {
  id?: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  type: 'Installation' | 'Maintenance' | 'Repair' | 'Inspection';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  date: string;
  issueTitle?: string;
  assignedEngineer: string;
  assignedEngineerId?: string;
  description: string;
  notes?: ServiceNote[];
  createdAt?: string;
  updatedAt?: string;
  createdBy?: 'admin' | 'customer';
  customerUid?: string;
}

export interface ServiceNote {
  id: string;
  text: string;
  addedBy: string;
  addedByRole: 'admin' | 'engineer' | 'customer';
  timestamp: string;
}

/**
 * Create a new service request
 */
export async function createServiceRequest(
  data: Omit<ServiceRequest, 'id' | 'createdAt' | 'updatedAt'>
) {
  try {
    const docId = await addFirestoreDoc('serviceRequests', {
      ...data,
      status: data.status || 'pending',
      priority: data.priority || 'medium',
      notes: data.notes || [],
    });
    return docId;
  } catch (error) {
    throw new Error(
      `Failed to create service request: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Update a service request
 */
export async function updateServiceRequest(
  id: string,
  data: Partial<ServiceRequest>
) {
  try {
    await updateFirestoreDoc('serviceRequests', id, data);
  } catch (error) {
    throw new Error(
      `Failed to update service request: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Assign an engineer to a service request
 */
export async function assignEngineer(
  serviceRequestId: string,
  engineerName: string,
  engineerId: string
) {
  try {
    await updateFirestoreDoc('serviceRequests', serviceRequestId, {
      assignedEngineer: engineerName,
      assignedEngineerId: engineerId,
      status: 'in-progress',
    });
  } catch (error) {
    throw new Error(
      `Failed to assign engineer: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Update service request status
 */
export async function updateServiceStatus(
  serviceRequestId: string,
  status: ServiceRequest['status']
) {
  try {
    await updateFirestoreDoc('serviceRequests', serviceRequestId, {
      status,
    });
  } catch (error) {
    throw new Error(
      `Failed to update status: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Add a note to a service request
 */
export async function addServiceNote(
  serviceRequestId: string,
  note: Omit<ServiceNote, 'id' | 'timestamp'>
) {
  try {
    const docRef = doc(db, 'serviceRequests', serviceRequestId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error('Service request not found');
    }

    const currentData = docSnap.data();
    const existingNotes: ServiceNote[] = currentData.notes || [];

    const newNote: ServiceNote = {
      id: Date.now().toString(),
      ...note,
      timestamp: new Date().toISOString(),
    };

    await updateFirestoreDoc('serviceRequests', serviceRequestId, {
      notes: [...existingNotes, newNote],
    });

    return newNote;
  } catch (error) {
    throw new Error(
      `Failed to add note: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Get service requests by engineer ID
 */
export async function getServiceRequestsByEngineer(engineerId: string) {
  try {
    const requestsRef = collection(db, 'serviceRequests');
    const q = query(
      requestsRef,
      where('assignedEngineerId', '==', engineerId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as ServiceRequest[];
  } catch (error) {
    throw new Error(
      `Failed to get service requests: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Get service requests by customer ID
 */
export async function getServiceRequestsByCustomer(customerId: string) {
  try {
    const requestsRef = collection(db, 'serviceRequests');
    const q = query(
      requestsRef,
      where('customerId', '==', customerId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as ServiceRequest[];
  } catch (error) {
    throw new Error(
      `Failed to get service requests: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Get a single service request by ID
 */
export async function getServiceRequestById(id: string) {
  try {
    const docRef = doc(db, 'serviceRequests', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as ServiceRequest;
    }
    return null;
  } catch (error) {
    throw new Error(
      `Failed to get service request: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Delete a service request
 */
export async function deleteServiceRequest(id: string) {
  try {
    await deleteFirestoreDoc('serviceRequests', id);
  } catch (error) {
    throw new Error(
      `Failed to delete service request: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}