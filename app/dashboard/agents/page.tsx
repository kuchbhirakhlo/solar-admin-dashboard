import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { Plus, ChevronRight, MapPin, Users } from 'lucide-react';
import { MOCK_AGENTS } from '@/lib/constants';
import Link from 'next/link';

export default function AgentsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Sales Agents"
        description="Manage your sales team and track their performance"
        action={
          <Link href="/dashboard/agents/new">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus size={20} className="mr-2" />
              Add Agent
            </Button>
          </Link>
        }
      />

      {/* Agents Grid */}
      <div className="px-6 py-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {MOCK_AGENTS.map((agent) => (
            <Link key={agent.id} href={`/dashboard/agents/${agent.id}`}>
              <div className="group rounded-lg border border-border bg-card p-6 transition-all hover:shadow-lg hover:border-primary/50 cursor-pointer">
                {/* Header */}
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {agent.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{agent.email}</p>
                  </div>
                  <StatusBadge status={agent.status as any} />
                </div>

                {/* Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin size={16} />
                    {agent.region}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users size={16} />
                    {agent.customersCount} customers
                  </div>
                </div>

                {/* Stats */}
                <div className="border-t border-border pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Total Customers</p>
                      <p className="text-2xl font-bold text-foreground">
                        {agent.customersCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">This Month</p>
                      <p className="text-2xl font-bold text-primary">
                        {agent.thisMonth}
                      </p>
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
