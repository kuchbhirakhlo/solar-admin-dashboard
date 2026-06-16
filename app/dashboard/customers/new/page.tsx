import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/layout/page-header';

export default function AddCustomerPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Add New Customer"
        description="Create a new customer account"
        breadcrumbs={[
          { label: 'Customers', href: '/dashboard/customers' },
          { label: 'New Customer' },
        ]}
      />

      {/* Form */}
      <div className="px-6 py-6 max-w-2xl">
        <div className="rounded-lg border border-border bg-card p-8 space-y-6">
          {/* Personal Information */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Personal Information
            </h2>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    First Name
                  </label>
                  <Input placeholder="John" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Last Name
                  </label>
                  <Input placeholder="Smith" />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email
                  </label>
                  <Input type="email" placeholder="john@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Phone
                  </label>
                  <Input type="tel" placeholder="+1 (555) 000-0000" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Address
                </label>
                <Input placeholder="123 Main Street" />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    City
                  </label>
                  <Input placeholder="Los Angeles" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    State
                  </label>
                  <Input placeholder="CA" />
                </div>
              </div>
            </div>
          </div>

          {/* System Information */}
          <div className="border-t border-border pt-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Solar System Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  System Size (kW)
                </label>
                <Input placeholder="6.5" />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Installation Date
                </label>
                <Input type="date" />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Subscription Plan
                </label>
                <select className="w-full rounded-lg border border-border bg-card px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                  <option>Select a plan...</option>
                  <option>Starter - $99/month</option>
                  <option>Professional - $249/month</option>
                  <option>Enterprise - $499/month</option>
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-border pt-6 flex gap-3 justify-end">
            <Button variant="outline">Cancel</Button>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              Create Customer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
