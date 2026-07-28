'use client';

import { useState } from 'react';
import { useFirestoreCollectionRealtime } from '@/lib/hooks/useFirestore';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { Plus, MapPin, Phone } from 'lucide-react';
import { User } from '@/lib/services/users';
import { where } from 'firebase/firestore';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ProjectStatusBar } from '@/components/dashboard/project-status-bar';
import { Customer } from '@/lib/services/customers';

export default function EmployeePage() {
  const { data: users, loading, error } =
    useFirestoreCollectionRealtime<User>('users', [
      where('role', 'in', ['agent', 'engineer', 'registrar', 'partner']),
    ]);

  const Employee = users;

  const [selectedAgent, setSelectedAgent] = useState<User | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [agentCustomers, setAgentCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  const toggleEmployeeStatus = async (
    employeeId: string | undefined,
    currentStatus: string
  ) => {
    if (!employeeId) return;
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      const { updateFirestoreDoc } = await import('@/lib/hooks/useFirestore');
      await updateFirestoreDoc('users', employeeId, { status: newStatus });
    } catch (err) {
      console.error('Failed to update employee status:', err);
    }
  };

  const openDetails = async (agent: User) => {
    setSelectedAgent(agent);
    setDialogOpen(true);
    
    // Fetch customers associated with this agent
    if (agent.customerId) {
      setLoadingCustomers(true);
      try {
        const { useFirestoreDoc } = await import('@/lib/hooks/useFirestore');
        // For now, we'll just show the agent's assigned customer if available
        // In a real app, you'd query customers by agentId
        setAgentCustomers([]);
      } catch (err) {
        console.error('Failed to load agent customers:', err);
      } finally {
        setLoadingCustomers(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Employees"
        description="Manage your employees - engineers, registrars, and partners"
        action={
          <Link href="/dashboard/agents/new">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus size={20} className="mr-2" />
              Add Employee
            </Button>
          </Link>
        }
      />

      {/* Employee Table */}
      <div className="px-6 py-6">
        {error && (
          <p className="text-sm text-red-500 mb-4">Failed to load employees: {error}</p>
        )}

        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Email</th>
                  <th className="px-6 py-3 font-medium">Phone</th>
                  <th className="px-6 py-3 font-medium">Role</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-4 text-center text-muted-foreground"
                    >
                      Loading employees...
                    </td>
                  </tr>
                )}
                {!loading &&
                  Employee?.map((employee) => (
                    <tr
                      key={employee.id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-foreground">
                        {employee.name}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {employee.email}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {employee.phone}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {employee.role === 'agent' ? 'Partner' : employee.role === 'registrar' ? 'Registrar' : employee.role === 'engineer' ? 'Engineer' : employee.role === 'partner' ? 'Partner' : employee.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={(employee.status as any) || 'active'} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDetails(employee)}
                          >
                            View Details
                          </Button>
                          <Button
                            size="sm"
                            variant={
                              employee.status === 'active'
                                ? 'destructive'
                                : 'default'
                            }
                            onClick={() =>
                              toggleEmployeeStatus(
                                employee.id,
                                employee.status || 'active'
                              )
                            }
                          >
                            {employee.status === 'active'
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Employee Details</DialogTitle>
          </DialogHeader>
          {selectedAgent && (
            <div className="space-y-6">
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

              {/* Assigned Customers Section */}
              {selectedAgent.customerId && (
                <div className="border-t border-border pt-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3">
                    Assigned Customers
                  </h3>
                  {loadingCustomers ? (
                    <p className="text-sm text-muted-foreground">Loading customers...</p>
                  ) : agentCustomers.length > 0 ? (
                    <div className="space-y-3">
                      {agentCustomers.map((customer) => (
                        <div
                          key={customer.id}
                          className="rounded-lg border border-border p-3"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-foreground">{customer.name}</p>
                              <p className="text-xs text-muted-foreground">{customer.email}</p>
                            </div>
                            <StatusBadge status={customer.status as any} />
                          </div>
                          <div className="mt-3">
                            <p className="text-xs text-muted-foreground mb-2">Project Status</p>
                            <ProjectStatusBar 
                              currentStatus={customer.projectStatus || 'registration'} 
                              readonly={true}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No customers assigned</p>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}