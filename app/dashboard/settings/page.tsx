import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronRight, Lock, Users, Zap } from 'lucide-react';

const SETTINGS_SECTIONS = [
  {
    id: 'account',
    title: 'Account Settings',
    description: 'Manage your account information and preferences',
    icon: <Users size={24} />,
  },
  {
    id: 'billing',
    title: 'Billing & Subscription',
    description: 'Manage billing, invoices, and subscription',
    icon: <Zap size={24} />,
  },
  {
    id: 'security',
    title: 'Security',
    description: 'Update password and manage security settings',
    icon: <Lock size={24} />,
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Settings"
        description="Manage your account and system settings"
      />

      {/* Settings Sections */}
      <div className="px-6 py-6 space-y-4">
        {SETTINGS_SECTIONS.map((section) => (
          <button
            key={section.id}
            className="w-full rounded-lg border border-border bg-card p-6 hover:shadow-lg hover:border-primary/50 transition-all flex items-center justify-between group"
          >
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-primary/10 p-3 text-primary">
                {section.icon}
              </div>
              <div className="text-left">
                <h3 className="text-lg font-semibold text-foreground">
                  {section.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {section.description}
                </p>
              </div>
            </div>
            <ChevronRight className="text-muted-foreground group-hover:text-primary transition-colors" />
          </button>
        ))}
      </div>

      {/* Company Information */}
      <div className="px-6 py-6 border-t border-border">
        <h2 className="mb-6 text-lg font-semibold text-foreground">
          Company Information
        </h2>

        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Company Name
              </label>
              <Input
                defaultValue="SolarFlow Inc"
                placeholder="Your company name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email
              </label>
              <Input
                defaultValue="admin@solarflow.com"
                placeholder="Contact email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Phone
              </label>
              <Input
                defaultValue="+1 (555) 123-4567"
                placeholder="Contact phone"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Website
              </label>
              <Input
                defaultValue="www.solarflow.com"
                placeholder="Company website"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Address
            </label>
            <Input
              defaultValue="123 Solar Street, San Francisco, CA 94105"
              placeholder="Company address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Business Description
            </label>
            <textarea
              defaultValue="Leading solar energy solutions provider offering residential and commercial solar panel installations, maintenance, and monitoring services."
              className="w-full rounded-lg border border-border bg-card px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              rows={4}
            />
          </div>

          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            Save Changes
          </Button>
        </div>
      </div>

      {/* API Settings */}
      <div className="px-6 py-6 border-t border-border">
        <h2 className="mb-6 text-lg font-semibold text-foreground">
          API Settings
        </h2>

        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-foreground">API Key</h3>
                <p className="text-sm text-muted-foreground">
                  Your secret API key for third-party integrations
                </p>
              </div>
              <Button variant="outline" size="sm">
                Regenerate
              </Button>
            </div>
            <Input
              type="password"
              defaultValue="sk_live_abc123def456..."
              className="font-mono"
            />
          </div>

          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-foreground">
                  Webhook Endpoint
                </h3>
                <p className="text-sm text-muted-foreground">
                  Configure webhook notifications
                </p>
              </div>
              <Button variant="outline" size="sm">
                Configure
              </Button>
            </div>
            <Input placeholder="https://your-domain.com/webhooks" />
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="px-6 py-6 border-t border-border">
        <h2 className="mb-6 text-lg font-semibold text-red-600">Danger Zone</h2>

        <div className="rounded-lg border-2 border-red-200 bg-red-50 p-6">
          <h3 className="font-semibold text-red-900">Delete Account</h3>
          <p className="mt-2 text-sm text-red-800">
            This action cannot be undone. All your data will be permanently deleted.
          </p>
          <Button
            variant="destructive"
            className="mt-4 bg-red-600 text-white hover:bg-red-700"
          >
            Delete Account
          </Button>
        </div>
      </div>
    </div>
  );
}
