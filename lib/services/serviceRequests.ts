export interface ServiceRequest {
  id?: string;
  customerId: string;
  customerName: string;
  type: 'Installation' | 'Maintenance' | 'Repair' | 'Inspection';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  date: string;
  assignedEngineer: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}