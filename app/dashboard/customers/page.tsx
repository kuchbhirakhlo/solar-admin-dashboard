import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/layout/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { Search, Plus, ChevronRight } from 'lucide-react';
import { MOCK_CUSTOMERS } from '@/lib/constants';
import Link from 'next/link';

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Customers"
        description="Manage and view all customer accounts"
        action={
          <Link href="/dashboard/customers/new">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus size={20} className="mr-2" />
              Add Customer
            </Button>
          </Link>
        }
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
                  Location
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  System Size
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Total Spent
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {MOCK_CUSTOMERS.map((customer) => (
                <tr
                  key={customer.id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <p className="font-medium text-foreground">{customer.name}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {customer.email}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {customer.location}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-foreground">
                    {customer.systemSize}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={customer.status as any} />
                  </td>
                  <td className="px-6 py-4 font-semibold text-foreground">
                    {customer.totalSpent}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Link href={`/dashboard/customers/${customer.id}`}>
                      <button className="inline-flex items-center justify-center rounded-lg p-2 hover:bg-muted">
                        <ChevronRight
                          size={20}
                          className="text-muted-foreground"
                        />
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {MOCK_CUSTOMERS.length} customers
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
