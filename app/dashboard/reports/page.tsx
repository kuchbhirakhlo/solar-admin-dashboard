import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { Download, Calendar, Filter } from 'lucide-react';

const REPORTS = [
  {
    id: '1',
    title: 'Monthly Revenue Report',
    description: 'Complete revenue breakdown for January 2024',
    date: '2024-02-01',
    size: '2.4 MB',
  },
  {
    id: '2',
    title: 'Customer Acquisition Report',
    description: 'New customer analytics and demographics',
    date: '2024-01-31',
    size: '1.8 MB',
  },
  {
    id: '3',
    title: 'Installation Performance Report',
    description: 'Installation completion rates and engineer performance',
    date: '2024-01-30',
    size: '3.2 MB',
  },
  {
    id: '4',
    title: 'Service Request Analysis',
    description: 'Service request trends and resolution times',
    date: '2024-01-29',
    size: '2.1 MB',
  },
  {
    id: '5',
    title: 'Subscription Analytics',
    description: 'Subscription tier distribution and churn analysis',
    date: '2024-01-28',
    size: '1.5 MB',
  },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Reports"
        description="Access business intelligence and analytics reports"
        action={
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Calendar size={20} className="mr-2" />
            Generate Custom Report
          </Button>
        }
      />

      {/* Filters */}
      <div className="px-6 py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <input
            type="text"
            placeholder="Search reports..."
            className="flex-1 rounded-lg border border-border bg-card px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button variant="outline">
            <Filter size={20} className="mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="px-6 py-6">
        <div className="grid gap-4 md:grid-cols-2">
          {REPORTS.map((report) => (
            <div
              key={report.id}
              className="rounded-lg border border-border bg-card p-6 hover:shadow-lg transition-all"
            >
              {/* Header */}
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {report.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {report.description}
                  </p>
                </div>
                <button className="rounded-lg p-2 hover:bg-muted">
                  <Download size={20} className="text-primary" />
                </button>
              </div>

              {/* Footer */}
              <div className="border-t border-border pt-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Generated</p>
                  <p className="text-sm font-medium text-foreground">
                    {report.date}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">File Size</p>
                  <p className="text-sm font-medium text-foreground">
                    {report.size}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scheduled Reports */}
      <div className="px-6 py-6 border-t border-border">
        <h2 className="mb-6 text-xl font-bold text-foreground">
          Scheduled Reports
        </h2>
        <div className="space-y-3">
          {[
            {
              name: 'Daily Performance Summary',
              frequency: 'Every day at 8:00 AM',
              recipients: '5 recipients',
            },
            {
              name: 'Weekly Sales Report',
              frequency: 'Every Monday at 9:00 AM',
              recipients: '3 recipients',
            },
            {
              name: 'Monthly Financial Report',
              frequency: 'First day of each month',
              recipients: '2 recipients',
            },
          ].map((scheduled, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-border bg-card p-4 flex items-center justify-between"
            >
              <div>
                <p className="font-medium text-foreground">{scheduled.name}</p>
                <p className="text-sm text-muted-foreground">
                  {scheduled.frequency} • {scheduled.recipients}
                </p>
              </div>
              <Button variant="outline" size="sm">
                Edit
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
