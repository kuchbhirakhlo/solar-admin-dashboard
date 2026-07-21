'use client';

import { useState } from 'react';
import { useFirestoreCollectionRealtime } from '@/lib/hooks/useFirestore';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { Plus, ChevronRight, MapPin, Phone } from 'lucide-react';
import { User } from '@/lib/services/users';
import { where } from 'firebase/firestore';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function PartnerPage() {
  const { data: users, loading, error } =
    useFirestoreCollectionRealtime<User>('users', [
      where('role', '==', 'agent'),
    ]);

  const Partner = users;

  const [selectedAgent, setSelectedAgent] = useState<User | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const togglePartnertatus = async (
    agentId: string | undefined,
    currentStatus: string
  ) => {
    if (!agentId) return;
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      const { updateFirestoreDoc } = await import('@/lib/hooks/useFirestore');
      await updateFirestoreDoc('users', agentId, { status: newStatus });
    } catch (err) {
      console.error('Failed to update agent status:', err);
    }
  };

  const openDetails = (agent: User) => {
    setSelectedAgent(agent);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Sales Partner"
        description="Manage your sales team and track their performance"
        action={
          <Link href="/dashboard/Partner/new">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus size={20} className="mr-2" />
              Add Agent
            </Button>
          </Link>
        }
      />

      {/* Partner Table */}
      <div className="px-6 py-6">
        {error && (
          <p className="text-sm text-red-500 mb-4">Failed to load Partner: {error}</p>
        )}

        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Email</th>
                  <th className="px-6 py-3 font-medium">Phone</th>
                  <th className="px-6 py-3 font-medium">Location</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-4 text-center text-muted-foreground"
                    >
                      Loading Partner...
                    </td>
                  </tr>
                )}
                {!loading &&
                  Partner?.map((agent) => (
                    <tr
                      key={agent.id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-foreground">
                        {agent.name}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {agent.email}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {agent.phone}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <MapPin size={14} />
                          {agent.city}, {agent.state}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={(agent.status as any) || 'active'} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDetails(agent)}
                          >
                            View Details
                          </Button>
                          <Button
                            size="sm"
                            variant={
                              agent.status === 'active'
                                ? 'destructive'
                                : 'default'
                            }
                            onClick={() =>
                              togglePartnertatus(
                                agent.id,
                                agent.status || 'active'
                              )
                            }
                          >
                            {agent.status === 'active'
                              ? 'Deactivate'
                              : 'Activate'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Agent Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agent Details</DialogTitle>
          </DialogHeader>
          {selectedAgent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Full Name</p>
                  <p className="text-sm font-medium text-foreground">
                    {selectedAgent.name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium text-foreground">
                    {selectedAgent.email}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm font-medium text-foreground">
                    {selectedAgent.phone}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <StatusBadge status={(selectedAgent.status as any) || 'active'} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">City</p>
                  <p className="text-sm font-medium text-foreground">
                    {selectedAgent.city}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">State</p>
                  <p className="text-sm font-medium text-foreground">
                    {selectedAgent.state}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Address</p>
                  <p className="text-sm font-medium text-foreground">
                    {selectedAgent.address || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">ZIP Code</p>
                  <p className="text-sm font-medium text-foreground">
                    {selectedAgent.zipCode || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Role</p>
                  <p className="text-sm font-medium text-foreground">
                    {selectedAgent.role}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Created At</p>
                  <p className="text-sm font-medium text-foreground">
                    {selectedAgent.createdAt
                      ? new Date(selectedAgent.createdAt).toLocaleString()
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Updated At</p>
                  <p className="text-sm font-medium text-foreground">
                    {selectedAgent.updatedAt
                      ? new Date(selectedAgent.updatedAt).toLocaleString()
                      : '-'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
