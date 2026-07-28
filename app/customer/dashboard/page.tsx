'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useCustomerStatus } from '@/lib/hooks/useCustomerStatus';
import { PageHeader } from '@/components/layout/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { ProjectStatusBar, ProjectStatus } from '@/components/dashboard/project-status-bar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, MapPin, Calendar, Zap, FileText } from 'lucide-react';

interface CustomerData {
  id: string;
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
  projectStatus?: ProjectStatus;
  connectionNumber?: string;
  monthlyUsage?: number;
  documents?: Record<string, string>;
  createdAt?: string;
}

export default function CustomerDashboardPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real-time customer status updates
  const { status: liveStatus } = useCustomerStatus(customerId);

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        // Get customer ID from session storage (set during login)
        const sessionCustomerId = sessionStorage.getItem('customerId');
        const customerUid = sessionStorage.getItem('customerUid');

        if (!sessionCustomerId && !customerUid) {
          router.push('/auth/customer-login');
          return;
        }

        // Try to get customer by ID first, then by UID
        let customerDoc = null;
        let customerData = null;
        let resolvedCustomerId: string | null = null;

        if (sessionCustomerId) {
          const docRef = doc(db, 'customers', sessionCustomerId);
          customerDoc = await getDoc(docRef);
          if (customerDoc.exists()) {
            customerData = { id: customerDoc.id, ...customerDoc.data() } as CustomerData;
            resolvedCustomerId = customerDoc.id;
          }
        }

        if (!customerData && customerUid) {
          const customersRef = collection(db, 'customers');
          const q = query(customersRef, where('customerUid', '==', customerUid));
          const snapshot = await getDocs(q);
          
          if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            customerData = { id: doc.id, ...doc.data() } as CustomerData;
            resolvedCustomerId = doc.id;
          }
        }

        if (customerData) {
          setCustomer(customerData);
          setCustomerId(resolvedCustomerId);
        } else {
          setError('Customer record not found');
        }
      } catch (err) {
        console.error('Failed to load customer data:', err);
        setError('Failed to load customer data');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, [router]);

  const formatTimestamp = (value: string | { seconds: number; nanoseconds: number } | undefined | null): string => {
    if (!value) return 'N/A';
    if (typeof value === 'object' && 'seconds' in value) {
      return new Date(value.seconds * 1000).toLocaleDateString();
    }
    if (typeof value === 'string' && value.length > 0) {
      const date = new Date(value);
      return isNaN(date.getTime()) ? value : date.toLocaleDateString();
    }
    return 'N/A';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading your dashboard...</p>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-red-600">{error || 'Error loading dashboard'}</p>
      </div>
    );
  }

  const fullAddress = [customer.address, customer.city, customer.state, customer.zipCode]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="space-y-6 p-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Welcome, {customer.name}
        </h1>
        <p className="text-muted-foreground mt-1">
          Track your solar installation project status
        </p>
      </div>

      {/* Status Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Account Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Account Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Your account is currently</p>
                <StatusBadge status={liveStatus || customer.status} />
                {liveStatus && liveStatus !== customer.status && (
                  <p className="text-xs text-green-600 mt-1">(Live — updated in real-time)</p>
                )}
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">Customer Since</p>
              <p className="font-semibold text-foreground">{formatTimestamp(customer.createdAt)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Project Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Project Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Current stage of your installation
            </p>
            <ProjectStatusBar 
              currentStatus={customer.projectStatus || 'registration'} 
              readonly={true}
            />
          </CardContent>
        </Card>
      </div>

      {/* Project Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Project Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3">
              <Zap size={20} className="text-primary mt-1" />
              <div>
                <p className="text-sm text-muted-foreground">System Size</p>
                <p className="font-semibold text-foreground">{customer.systemSize} kW</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FileText size={20} className="text-primary mt-1" />
              <div>
                <p className="text-sm text-muted-foreground">Connection Number</p>
                <p className="font-semibold text-foreground">{customer.connectionNumber || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar size={20} className="text-primary mt-1" />
              <div>
                <p className="text-sm text-muted-foreground">Installation Date</p>
                <p className="font-semibold text-foreground">{formatTimestamp(customer.installationDate)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Zap size={20} className="text-primary mt-1" />
              <div>
                <p className="text-sm text-muted-foreground">Monthly Usage</p>
                <p className="font-semibold text-foreground">{customer.monthlyUsage ? `${customer.monthlyUsage} kWh` : 'N/A'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Mail size={20} className="text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium text-foreground">{customer.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone size={20} className="text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Mobile Number</p>
              <p className="font-medium text-foreground">{customer.phone}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MapPin size={20} className="text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Address</p>
              <p className="font-medium text-foreground">{fullAddress}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents Section */}
      {customer.documents && Object.keys(customer.documents).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {Object.entries(customer.documents).map(([key, url]) => (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-muted transition-colors"
                >
                  <FileText size={20} className="text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </p>
                    <p className="text-xs text-muted-foreground">View Document</p>
                  </div>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Information Note */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Your project status is updated in real-time by our team. 
            The status bar above shows the current stage of your solar installation. 
            If you have any questions, please contact our support team.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
