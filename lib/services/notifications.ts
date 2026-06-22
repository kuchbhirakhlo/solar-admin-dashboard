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

export async function addNotification(notification: Omit<Notification, 'id'>) {
  try {
    // Placeholder: add realtime hint
    return null;
  } catch (error) {
    throw new Error(`Failed to add notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}