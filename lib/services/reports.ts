export interface Report {
  id?: string;
  title: string;
  description: string;
  type: 'revenue' | 'customer' | 'installation' | 'service' | 'subscription';
  generatedAt: Date;
  fileSize: string;
  fileUrl?: string;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}