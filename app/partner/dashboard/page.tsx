'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PageHeader } from '@/components/layout/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, MapPin, Users } from 'lucide-react';

interface PartnerData {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  status: 'active' | 'pending' | 'inactive';
  customers?: string[];
  createdAt?: string;
}

export default function PartnerDashboardPage() {
  const router = useRouter();
  const [partner, setPartner] = useState<PartnerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPartnerData = async () => {
      try {
        const partnerUid = sessionStorage.getItem('customerUid');
        const userRole = sessionStorage.getItem('userRole');

        if (!partnerUid || userRole !== 'partner') {
          router.push('/auth/customer-login');
          return;
        }

        const userDocRef = doc(db, 'users', partnerUid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          setError('Partner record not found');
          return;
        }

        const userData = userDoc.data();
        const partnerData: PartnerData = {
          id: userDoc.id,
          name: userData.displayName || userData.name || 'Partner',
          email: userData.email,
          phone: userData.phone || '',
          address: userData.address || '',
          city: userData.city || '',
          state: userData.state || '',
          zipCode: userData.zipCode || '',
          status: userData.status || 'active',
          customers: userData.customers || [],
          createdAt: userData.createdAt,
        };

        setPartner(partnerData);
      } catch (err) {
        console.error('Failed to load partner data:', err);
        setError('Failed to load partner data');
      } finally {
        setLoading(false);
      }
    };

    fetchPartnerData();
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

  if (error || !partner) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-red-600">{error || 'Error loading dashboard'}</p>
      </div>
    );
  }

  const fullAddress = [partner.address, partner.city, partner.state, partner.zipCode]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Welcome, {partner.name}
        </h1>
        <p className="text-muted-foreground mt-1">
          Partner Dashboard - Manage your customers
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Account Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Your account is</p>
                <StatusBadge status={partner.status} />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">Partner Since</p>
              <p className="font-semibold text-foreground">{formatTimestamp(partner.createdAt)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-3">
                <Users size={24} className="text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">
                  {partner.customers?.length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Total Customers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                View customer details and project status
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Mail size={20} className="text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium text-foreground">{partner.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone size={20} className="text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Mobile Number</p>
              <p className="font-medium text-foreground">{partner.phone || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MapPin size={20} className="text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Address</p>
              <p className="font-medium text-foreground">{fullAddress || 'N/A'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> As a partner, you can view your customer list and their project status. 
            The admin updates the project status in real-time, and you can see the current stage of each installation. 
            If you have any questions, please contact our support team.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

