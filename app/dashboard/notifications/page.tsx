import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Bell, AlertCircle, CheckCircle, Info, Trash2 } from 'lucide-react';
import { MOCK_NOTIFICATIONS } from '@/lib/constants';

const ICON_MAP: Record<string, React.ReactNode> = {
  info: <Info size={20} className="text-blue-500" />,
  success: <CheckCircle size={20} className="text-green-500" />,
  warning: <AlertCircle size={20} className="text-yellow-500" />,
  error: <AlertCircle size={20} className="text-red-500" />,
};

export default function NotificationsPage() {
  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Notifications"
        description="View and manage your notifications"
        action={
          <Button variant="outline">Mark all as read</Button>
        }
      />

      {/* Notification Tabs */}
      <div className="border-b border-border">
        <div className="px-6 flex gap-8">
          {['All', 'Unread', 'Service', 'Payment', 'System'].map((tab) => (
            <button
              key={tab}
              className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                tab === 'All'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="px-6 py-6 space-y-3">
        {MOCK_NOTIFICATIONS.map((notification, idx) => (
          <div
            key={notification.id}
            className={`rounded-lg border p-4 flex gap-4 items-start transition-all ${
              idx === 0
                ? 'border-primary/30 bg-primary/5'
                : 'border-border bg-card hover:shadow-md'
            }`}
          >
            {/* Icon */}
            <div className="mt-1 flex-shrink-0">
              {ICON_MAP[notification.type] || ICON_MAP['info']}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground">
                {notification.title}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                {notification.description}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {formatTime(notification.timestamp)}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 flex-shrink-0">
              <button className="rounded-lg p-2 hover:bg-muted">
                <Trash2 size={16} className="text-muted-foreground" />
              </button>
            </div>
          </div>
        ))}

        {/* More Notifications */}
        <div className="rounded-lg border border-border bg-card p-6 text-center">
          <Bell size={32} className="mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-muted-foreground">No more notifications</p>
          <Button variant="outline" className="mt-4">
            View Archive
          </Button>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="border-t border-border bg-card px-6 py-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Notification Settings
        </h2>

        <div className="space-y-4">
          {[
            {
              label: 'Service Requests',
              description: 'Notifications about new and updated service requests',
            },
            {
              label: 'Payment Alerts',
              description: 'Notifications about payments and invoices',
            },
            {
              label: 'Installation Updates',
              description: 'Updates on installation progress',
            },
            {
              label: 'System Alerts',
              description: 'Important system and account notifications',
            },
          ].map((setting, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-lg border border-border p-4"
            >
              <div>
                <p className="font-medium text-foreground">{setting.label}</p>
                <p className="text-sm text-muted-foreground">
                  {setting.description}
                </p>
              </div>
              <label className="flex items-center">
                <input type="checkbox" defaultChecked className="h-4 w-4" />
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
