'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { Input } from '@/components/ui/input';
import { createServiceRequest } from '@/lib/services/serviceRequests';
import { addServiceAssignmentNotification } from '@/lib/services/notifications';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ArrowLeft, Search, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface CustomerSearchResult {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

interface EngineerOption {
  id: string;
  name: string;
  phone: string;
  uid?: string;
}

export default function NewServiceRequestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchPhone, setSearchPhone] = useState('');
  const [searchResults, setSearchResults] = useState<CustomerSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSearchResult | null>(null);

  const [engineers, setEngineers] = useState<EngineerOption[]>([]);
  const [selectedEngineerId, setSelectedEngineerId] = useState('');

  const [formData, setFormData] = useState({
    type: 'Maintenance' as 'Installation' | 'Maintenance' | 'Repair' | 'Inspection',
    date: new Date().toISOString().split('T')[0],
    issueTitle: '',
    description: '',
  });

  useEffect(() => {
    fetchEngineers();
  }, []);

  const fetchEngineers = async () => {
    try {
      const engineersRef = collection(db, 'engineers');
      const q = query(engineersRef, where('status', '==', 'active'));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as EngineerOption[];
      setEngineers(list);
    } catch (err) {
      console.error('Failed to load engineers:', err);
    }
  };

  const searchCustomer = async () => {
    if (!searchPhone.trim()) return;
    setSearching(true);
    setSearchResults([]);
    try {
      const customersRef = collection(db, 'customers');
      const q = query(customersRef, where('phone', '==', searchPhone.trim()));
      const snapshot = await getDocs(q);
      const results = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as CustomerSearchResult[];
      setSearchResults(results);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) {
      setError('Please select a customer');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Find selected engineer
      const selectedEngineer = engineers.find((e) => e.id === selectedEngineerId);
      const engineerName = selectedEngineer?.name || '';
      const engineerId = selectedEngineer?.id || '';

      const docId = await createServiceRequest({
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        customerPhone: selectedCustomer.phone,
        type: formData.type,
        status: engineerId ? 'in-progress' : 'pending',
        date: formData.date,
        assignedEngineer: engineerName,
        assignedEngineerId: engineerId,
        issueTitle: formData.issueTitle,
        description: formData.description,
        createdBy: 'admin',
      });

      // Send notification to the engineer if assigned
      if (selectedEngineer) {
        await addServiceAssignmentNotification(
          selectedEngineer.id,
          selectedEngineer.name,
          docId,
          selectedCustomer.name,
          formData.type
        );
      }

      router.push(`/dashboard/services/${docId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create service request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Service Request"
        description="Create a new service request for a customer"
        breadcrumbs={[
          { label: 'Services', href: '/dashboard/services' },
          { label: 'New Service Request' },
        ]}
        action={
          <Link href="/dashboard/services">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft size={16} />
              Back to Services
            </Button>
          </Link>
        }
      />

      <div className="px-6 py-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Customer Selection */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Select Customer
            </h2>

            {!selectedCustomer ? (
              <>
                <div className="flex gap-2 mb-4">
                  <Input
                    placeholder="Search by phone number..."
                    value={searchPhone}
                    onChange={(e) => setSearchPhone(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), searchCustomer())}
                  />
                  <Button type="button" onClick={searchCustomer} disabled={searching}>
                    {searching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                    Search
                  </Button>
                </div>

                {searchResults.length > 0 ? (
                  <div className="space-y-2">
                    {searchResults.map((customer) => (
                      <div
                        key={customer.id}
                        className="flex items-center justify-between rounded-lg border border-border p-3 cursor-pointer hover:bg-muted transition-colors"
                        onClick={() => setSelectedCustomer(customer)}
                      >
                        <div>
                          <p className="font-medium text-foreground">{customer.name}</p>
                          <p className="text-sm text-muted-foreground">{customer.phone}</p>
                          {customer.email && (
                            <p className="text-sm text-muted-foreground">{customer.email}</p>
                          )}
                        </div>
                        <Button type="button" size="sm" variant="outline">
                          Select
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : searchPhone && !searching ? (
                  <p className="text-sm text-muted-foreground">No customers found with this phone number</p>
                ) : null}
              </>
            ) : (
              <div className="flex items-center justify-between rounded-lg border border-primary/50 bg-primary/5 p-3">
                <div>
                  <p className="font-medium text-foreground">{selectedCustomer.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedCustomer.phone}</p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedCustomer(null)}
                >
                  Change
                </Button>
              </div>
            )}
          </div>

          {/* Service Details */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Service Details
            </h2>

            <div className="space-y-4">
              {/* Service Type */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Service Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                >
                  <option value="Installation">Installation</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Repair">Repair</option>
                  <option value="Inspection">Inspection</option>
                </select>
              </div>

              {/* Issue Title */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Issue Title
                </label>
                <Input
                  placeholder="Brief title for the service issue..."
                  value={formData.issueTitle}
                  onChange={(e) => setFormData({ ...formData, issueTitle: e.target.value })}
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Service Date
                </label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              {/* Assigned Engineer */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Assign Engineer (Optional)
                </label>
                <select
                  value={selectedEngineerId}
                  onChange={(e) => setSelectedEngineerId(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                >
                  <option value="">Select engineer (optional)...</option>
                  {engineers.map((eng) => (
                    <option key={eng.id} value={eng.id}>
                      {eng.name} - {eng.phone}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-muted-foreground">
                  If assigned, the engineer will be notified and the status will be set to "In Progress"
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground resize-none"
                  placeholder="Describe the service request details..."
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button type="submit" disabled={loading || !selectedCustomer}>
              {loading && <Loader2 size={16} className="animate-spin mr-2" />}
              Create Service Request
            </Button>
            <Link href="/dashboard/services">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}