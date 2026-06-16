import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/layout/page-header';

export default function AddAgentPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Add New Agent"
        description="Create a new sales agent account"
        breadcrumbs={[
          { label: 'Agents', href: '/dashboard/agents' },
          { label: 'New Agent' },
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
                  <Input placeholder="Alex" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Last Name
                  </label>
                  <Input placeholder="Turner" />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email
                  </label>
                  <Input type="email" placeholder="alex@solarflow.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Phone
                  </label>
                  <Input type="tel" placeholder="+1 (555) 000-0000" />
                </div>
              </div>
            </div>
          </div>

          {/* Assignment Information */}
          <div className="border-t border-border pt-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Assignment Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Assigned Region
                </label>
                <select className="w-full rounded-lg border border-border bg-card px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                  <option>Select region...</option>
                  <option>Northern CA</option>
                  <option>Southern CA</option>
                  <option>Central CA</option>
                  <option>Bay Area</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Manager
                </label>
                <select className="w-full rounded-lg border border-border bg-card px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                  <option>Select manager...</option>
                  <option>Manager 1</option>
                  <option>Manager 2</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 mt-4">
                  <input type="checkbox" defaultChecked className="h-4 w-4" />
                  <span className="text-sm text-muted-foreground">
                    Send welcome email to agent
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-border pt-6 flex gap-3 justify-end">
            <Button variant="outline">Cancel</Button>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              Create Agent
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
