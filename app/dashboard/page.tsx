'use client';

import { useFirestoreCollectionRealtime } from '@/lib/hooks/useFirestore';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { StatCard } from '@/components/dashboard/stat-card';
import { Users, Zap, Briefcase, DollarSign, UserPlus, Wrench } from 'lucide-react';
import { Customer } from '@/lib/services/customers';
import { ServiceRequest } from '@/lib/services/serviceRequests';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const { data: customers } = useFirestoreCollectionRealtime<Customer>('customers');
  const { data: services } = useFirestoreCollectionRealtime<ServiceRequest>('serviceRequests');

  const totalCustomers = customers?.length ?? 0;
  const pendingServices = services?.filter((s) => s.status === 'pending' || s.status === 'in-progress').length ?? 0;

  return (
    <div className="space-y-6 bg-gradient-to-b from-green-50/60 via-white to-white min-h-full">
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
            className="border-green-200 bg-gradient-to-br from-green-50 to-white"
            trend={{
              value: 0,
              isPositive: true,
            }}
          />
          <StatCard
            title="Active Subscriptions"
            value={totalCustomers}
            icon={<Zap size={24} />}
            className="border-green-200 bg-gradient-to-br from-green-50 to-white"
            trend={{
              value: 0,
              isPositive: true,
            }}
          />
          <StatCard
            title="Pending Services"
            value={pendingServices}
            icon={<Briefcase size={24} />}
            className="border-green-200 bg-gradient-to-br from-green-50 to-white"
            trend={{
              value: 0,
              isPositive: false,
            }}
          />
          <StatCard
            title="Total Revenue (INR)"
            value={'₹0'}
            icon={<DollarSign size={24} />}
            className="border-green-200 bg-gradient-to-br from-green-50 to-white"
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
        <div className="rounded-lg border border-green-200 bg-white shadow-sm">
          <div className="border-b border-green-100 bg-green-50/70 px-6 py-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-green-800">
                Recent Customers
              </h2>
              <Button
                variant="ghost"
                size="sm"
                className="text-green-700 hover:bg-green-100 hover:text-green-800"
                onClick={() => router.push('/dashboard/customers')}
              >
                View All
              </Button>
            </div>
          </div>

          <div className="divide-y divide-green-100">
            {customers?.slice(0, 4).map((customer) => (
              <div
                key={customer.id}
                onClick={() => router.push(`/dashboard/customers/${customer.id}`)}
                className="flex cursor-pointer items-center justify-between px-6 py-4 hover:bg-green-50/60 transition-colors"
              >
                <div>
                  <p className="font-medium text-foreground">{customer.name}</p>
                  <p className="text-sm text-muted-foreground">{customer.email}</p>
                </div>
                <StatusBadge status={customer.status as any} />
              </div>
            ))}
            {(!customers || customers.length === 0) && (
              <p className="px-6 py-4 text-sm text-muted-foreground">No customers yet</p>
            )}
          </div>
        </div>

        {/* Recent Services */}
        <div className="rounded-lg border border-green-200 bg-white shadow-sm">
          <div className="border-b border-green-100 bg-green-50/70 px-6 py-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-green-800">
                Recent Services
              </h2>
              <Button
                variant="ghost"
                size="sm"
                className="text-green-700 hover:bg-green-100 hover:text-green-800"
                onClick={() => router.push('/dashboard/services')}
              >
                View All
              </Button>
            </div>
          </div>

          <div className="divide-y divide-green-100">
            {services?.slice(0, 4).map((service) => (
              <div
                key={service.id}
                onClick={() => router.push(`/dashboard/services/${service.id}`)}
                className="flex cursor-pointer items-center justify-between px-6 py-4 hover:bg-green-50/60 transition-colors"
              >
                <div>
                  <p className="font-medium text-foreground">
                    {service.issueTitle || service.type}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {service.customerName}
                  </p>
                </div>
                <StatusBadge status={service.status as any} />
              </div>
            ))}
            {(!services || services.length === 0) && (
              <p className="px-6 py-4 text-sm text-muted-foreground">No service requests yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="border-t border-green-100 bg-green-50/40 px-6 py-6">
        <h2 className="mb-4 text-lg font-semibold text-green-800">
          Quick Actions
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Button
            className="bg-green-600 text-foreground hover:bg-green-700"
            onClick={() => router.push('/dashboard/customers/new')}
          >
            <UserPlus size={18} />
            Add New Customer
          </Button>
          <Button
            variant="outline"
            className="border-green-300 text-green-700 hover:bg-green-50"
            onClick={() => router.push('/dashboard/services/new')}
          >
            <Wrench size={18} />
            Create Service Request
          </Button>
          <Button
            variant="outline"
            className="border-green-300 text-green-700 hover:bg-green-50"
            onClick={() => router.push('/dashboard/agents/new')}
          >
            <Users size={18} />
            Add New Employee
          </Button>
        </div>
      </div>
    </div>
  );
}
