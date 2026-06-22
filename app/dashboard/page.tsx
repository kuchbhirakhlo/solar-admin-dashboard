'use client';

import { useFirestoreCollectionRealtime } from '@/lib/hooks/useFirestore';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { StatCard } from '@/components/dashboard/stat-card';
import { Users, Zap, Briefcase, DollarSign } from 'lucide-react';
import { Customer } from '@/lib/services/customers';
import { ServiceRequest } from '@/lib/services/serviceRequests';
import { StatusBadge } from '@/components/dashboard/status-badge';

export default function DashboardPage() {
  const { data: customers, loading: customersLoading } = useFirestoreCollectionRealtime<Customer>('customers');
  const { data: services, loading: servicesLoading } = useFirestoreCollectionRealtime<ServiceRequest>('serviceRequests');

  const totalCustomers = customers?.length ?? 0;
  const pendingServices = services?.filter((s) => s.status === 'pending' || s.status === 'in-progress').length ?? 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's your business overview in India."
      />

      {/* Stats Grid */}
      <div className="px-6 py-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Customers"
            value={totalCustomers}
            icon={<Users size={24} />}
            trend={{
              value: 0,
              isPositive: true,
            }}
          />
          <StatCard
            title="Active Subscriptions"
            value={totalCustomers}
            icon={<Zap size={24} />}
            trend={{
              value: 0,
              isPositive: true,
            }}
          />
          <StatCard
            title="Pending Services"
            value={pendingServices}
            icon={<Briefcase size={24} />}
            trend={{
              value: 0,
              isPositive: false,
            }}
          />
          <StatCard
            title="Total Revenue (INR)"
            value={'₹0'}
            icon={<DollarSign size={24} />}
            trend={{
              value: 0,
              isPositive: true,
            }}
          />
        </div>
      </div>

      {/* Recent Customers & Services */}
      <div className="grid gap-6 px-6 lg:grid-cols-2">
        {/* Recent Customers */}
        <div className="rounded-lg border border-border bg-card">
          <div className="border-b border-border px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                Recent Customers
              </h2>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </div>
          </div>

          <div className="divide-y divide-border">
            {customers?.slice(0, 4).map((customer) => (
              <div key={customer.id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="font-medium text-foreground">{customer.name}</p>
                  <p className="text-sm text-muted-foreground">{customer.email}</p>
                </div>
                <StatusBadge status={customer.status as any} />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Services */}
        <div className="rounded-lg border border-border bg-card">
          <div className="border-b border-border px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                Recent Services
              </h2>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </div>
          </div>

          <div className="divide-y divide-border">
            {services?.map((service) => (
              <div
                key={service.id}
                className="flex items-center justify-between px-6 py-4"
              >
                <div>
                  <p className="font-medium text-foreground">{service.id}</p>
                  <p className="text-sm text-muted-foreground">
                    {service.customerName}
                  </p>
                </div>
                <StatusBadge status={service.status as any} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="border-t border-border bg-card px-6 py-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Quick Actions
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            Add New Customer
          </Button>
          <Button variant="outline">Create Service Request</Button>
          <Button variant="outline">Schedule Installation</Button>
          <Button variant="outline">Generate Report</Button>
        </div>
      </div>
    </div>
  );
}
