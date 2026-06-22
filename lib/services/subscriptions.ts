export interface Subscription {
  id?: string;
  customerId: string;
  customerName: string;
  planId: string;
  planName: string;
  price: number;
  period: 'monthly' | 'yearly';
  status: 'active' | 'pending' | 'cancelled' | 'expired';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  createdAt?: string;
  updatedAt?: string;
}