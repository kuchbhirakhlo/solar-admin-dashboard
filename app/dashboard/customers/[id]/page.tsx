import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { Mail, Phone, MapPin, Calendar, Zap, DollarSign } from 'lucide-react';
import { MOCK_CUSTOMERS } from '@/lib/constants';

export default function CustomerDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const customer = MOCK_CUSTOMERS.find((c) => c.id === params.id) ||
    MOCK_CUSTOMERS[0];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={customer.name}
        description="Customer details and account information"
        breadcrumbs={[
          { label: 'Customers', href: '/dashboard/customers' },
          { label: customer.name },
        ]}
        action={
          <div className="flex gap-2">
            <Button variant="outline">Edit</Button>
            <Button variant="outline" className="text-red-600 hover:bg-red-50">
              Delete
            </Button>
          </div>
        }
      />

      {/* Main Content */}
      <div className="px-6 py-6 grid gap-6 lg:grid-cols-3">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-6 text-lg font-semibold text-foreground">
              Contact Information
            </h2>

            <div className="space-y-4">
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
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium text-foreground">{customer.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={20} className="text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium text-foreground">{customer.location}</p>
                </div>
              </div>
            </div>
          </div>

          {/* System Information */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-6 text-lg font-semibold text-foreground">
              Solar System Information
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">System Size</p>
                  <p className="mt-1 flex items-center gap-2 font-medium text-foreground">
                    <Zap size={18} className="text-primary" />
                    {customer.systemSize}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Installation Date</p>
                  <p className="mt-1 flex items-center justify-end gap-2 font-medium text-foreground">
                    <Calendar size={18} className="text-primary" />
                    {customer.installDate}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Services */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-6 text-lg font-semibold text-foreground">
              Recent Services
            </h2>

            <div className="space-y-3">
              {[
                { id: 'SVC001', type: 'Installation', status: 'completed' },
                { id: 'SVC002', type: 'Maintenance', status: 'completed' },
                { id: 'SVC003', type: 'Inspection', status: 'completed' },
              ].map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted transition-colors"
                >
                  <div>
                    <p className="font-medium text-foreground">{service.id}</p>
                    <p className="text-sm text-muted-foreground">{service.type}</p>
                  </div>
                  <StatusBadge status={service.status as any} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Summary */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">Status</p>
            <div className="mt-3">
              <StatusBadge status={customer.status as any} />
            </div>
          </div>

          {/* Financial Summary */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-4 font-semibold text-foreground">
              Financial Summary
            </h3>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="mt-1 flex items-center gap-2 text-2xl font-bold text-foreground">
                  <DollarSign size={24} className="text-green-600" />
                  {customer.totalSpent}
                </p>
              </div>

              <div className="border-t border-border pt-3">
                <p className="text-sm text-muted-foreground">
                  Average Monthly Cost
                </p>
                <p className="mt-1 text-lg font-semibold text-foreground">
                  $185.50
                </p>
              </div>

              <div className="border-t border-border pt-3">
                <p className="text-sm text-muted-foreground">
                  Energy Savings (Annual)
                </p>
                <p className="mt-1 text-lg font-semibold text-green-600">
                  $2,450
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-4 font-semibold text-foreground">
              Quick Actions
            </h3>

            <div className="space-y-2">
              <Button variant="outline" className="w-full">
                Create Service Request
              </Button>
              <Button variant="outline" className="w-full">
                Send Invoice
              </Button>
              <Button variant="outline" className="w-full">
                Schedule Maintenance
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
