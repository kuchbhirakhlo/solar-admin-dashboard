import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { Plus, ChevronRight, Award, CheckCircle } from 'lucide-react';
import { MOCK_ENGINEERS } from '@/lib/constants';
import Link from 'next/link';

export default function EngineersPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Engineers"
        description="Manage installation and maintenance engineers"
        action={
          <Link href="/dashboard/engineers/new">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus size={20} className="mr-2" />
              Add Engineer
            </Button>
          </Link>
        }
      />

      {/* Engineers Grid */}
      <div className="px-6 py-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {MOCK_ENGINEERS.map((engineer) => (
            <Link key={engineer.id} href={`/dashboard/engineers/${engineer.id}`}>
              <div className="group rounded-lg border border-border bg-card p-6 transition-all hover:shadow-lg hover:border-primary/50 cursor-pointer">
                {/* Header */}
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {engineer.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {engineer.email}
                    </p>
                  </div>
                  <StatusBadge status={engineer.status as any} />
                </div>

                {/* Certification */}
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2">
                  <Award size={16} className="text-primary" />
                  <span className="text-sm font-medium text-primary">
                    {engineer.certification}
                  </span>
                </div>

                {/* Stats */}
                <div className="border-t border-border pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Completed Projects
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {engineer.completedProjects}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Active</p>
                      <div className="flex items-center gap-1">
                        <CheckCircle size={20} className="text-green-500" />
                        <p className="text-2xl font-bold text-foreground">
                          {engineer.activeProjects}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action */}
                <Button
                  variant="ghost"
                  className="mt-4 w-full"
                >
                  View Details
                  <ChevronRight size={16} className="ml-2" />
                </Button>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
