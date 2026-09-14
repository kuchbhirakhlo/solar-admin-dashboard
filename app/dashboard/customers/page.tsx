'use client';

import { useFirestoreCollectionRealtime } from '@/lib/hooks/useFirestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/layout/page-header';
import { Search } from 'lucide-react';
import { Customer } from '@/lib/services/customers';
import { useRouter } from 'next/navigation';
import { where } from 'firebase/firestore';

type CustomerProfile = Partial<Customer> & { id?: string; customerId?: string };

export default function CustomersPage() {
  const router = useRouter();
  const records = useFirestoreCollectionRealtime<Customer>('customers');
  const profiles = useFirestoreCollectionRealtime<CustomerProfile>('users', [where('role', '==', 'customer')]);
  const loading = records.loading || profiles.loading;
  const error = records.error || profiles.error;
  const customers: (CustomerProfile & { source: 'customers' | 'users' })[] =
    (records.data || []).map((customer) => ({ ...customer, source: 'customers' }));
  const recordIds = new Set(customers.map((customer) => customer.id));
  for (const profile of profiles.data || []) {
    if (!recordIds.has(profile.customerId || profile.id)) {
      customers.push({ ...profile, source: 'users' });
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading customers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-red-500">Failed to load customers: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Customers"
        description="Manage and view all customer accounts"
      />

      {/* Search & Filters */}
      <div className="px-6 py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Search by name, email..."
              className="pl-10"
            />
          </div>
          <Button variant="outline">Filters</Button>
          <Button variant="outline">Export</Button>
        </div>
      </div>

      {/* Customers Table */}
      <div className="px-6">
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  System Size
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Project Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {customers?.map((customer) => (
                <tr
                  key={`${customer.source}-${customer.id}`}
                  onClick={() => router.push(`/dashboard/customers/${customer.id}?source=${customer.source}`)}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <p className="font-medium text-foreground">{customer.name}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {customer.email}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-foreground">
                    {customer.systemSize ?? 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-foreground">
                      {customer.projectStatus ? customer.projectStatus.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Registration'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {customers?.length ?? 0} customers
            </p>
          <div className="flex gap-2">
            <Button variant="outline">Previous</Button>
            <Button variant="outline">Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
