'use client';

import { useFirestoreCollectionRealtime } from '@/lib/hooks/useFirestore';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { Download, Calendar, Filter } from 'lucide-react';
import { Report } from '@/lib/services/reports';

export default function ReportsPage() {
  const { data: reports, loading, error } = useFirestoreCollectionRealtime<Report>('reports');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading reports...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-red-500">Failed to load reports: {error}</p>
      </div>
    );
  }

  const displayReports = reports ?? [];

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
          {displayReports.map((report) => (
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
                    {report.generatedAt instanceof Date ? report.generatedAt.toISOString().split('T')[0] : report.generatedAt}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">File Size</p>
                  <p className="text-sm font-medium text-foreground">
                    {report.fileSize}
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
