import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Notification {
  id?: string;
  title: string;
  description: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  userId: string;
  timestamp: Date;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Add a notification to Firestore for a specific user
 */
export async function addNotification(notification: Omit<Notification, 'id'>) {
  try {
    const docRef = await addDoc(collection(db, 'notifications'), {
      ...notification,
      timestamp: Timestamp.fromDate(notification.timestamp),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    throw new Error(`Failed to add notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Add a service request assignment notification for an engineer
 */
export async function addServiceAssignmentNotification(
  engineerId: string,
  engineerName: string,
  serviceRequestId: string,
  customerName: string,
  serviceType: string
) {
  try {
    await addNotification({
      title: 'New Service Request Assigned',
      description: `You have been assigned a ${serviceType} service request for customer ${customerName}.`,
      type: 'info',
      read: false,
      userId: engineerId,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Failed to add assignment notification:', error);
  }
}
