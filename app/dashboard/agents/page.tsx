'use client';

import { useState } from 'react';
import { useFirestoreCollectionRealtime } from '@/lib/hooks/useFirestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/layout/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { User } from '@/lib/services/users';
import { where, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function EmployeePage() {
  const { data: users, loading, error } =
    useFirestoreCollectionRealtime<User>('users', [
      where('role', 'in', ['agent', 'engineer', 'registrar', 'partner']),
    ]);

  const [editEmployee, setEditEmployee] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', role: '', status: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const openEdit = (employee: User) => {
    setEditEmployee(employee);
    setEditForm({
      name: employee.name || '',
      email: employee.email || '',
      phone: employee.phone || '',
      role: employee.role || '',
      status: employee.status || 'active',
    });
    setEditError(null);
  };

  const handleEditSave = async () => {
    if (!editEmployee?.id) return;
    setEditLoading(true);
    setEditError(null);
    try {
      const { updateFirestoreDoc } = await import('@/lib/hooks/useFirestore');
      await updateFirestoreDoc('users', editEmployee.id, {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        role: editForm.role,
        status: editForm.status,
        updatedAt: Date.now(),
      });
      setEditEmployee(null);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Failed to update employee');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget?.id) return;
    setDeleteLoading(true);
    try {
      await deleteDoc(doc(db, 'users', deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      console.error('Failed to delete employee:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const toggleEmployeeStatus = async (employeeId: string | undefined, currentStatus: string) => {
    if (!employeeId) return;
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      const { updateFirestoreDoc } = await import('@/lib/hooks/useFirestore');
      await updateFirestoreDoc('users', employeeId, { status: newStatus });
    } catch (err) {
      console.error('Failed to update employee status:', err);
    }
  };

  const roleLabel = (role: string) => {
    if (role === 'agent' || role === 'partner') return 'Partner';
    if (role === 'registrar') return 'Registrar';
    if (role === 'engineer') return 'Engineer';
    return role;
  };

  return (
    <div className="space-y-6">
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
                    <td colSpan={6} className="px-6 py-4 text-center text-muted-foreground">
                      Loading employees...
                    </td>
                  </tr>
                )}
                {!loading && users?.map((employee) => (
                  <tr key={employee.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">{employee.name}</td>
                    <td className="px-6 py-4 text-muted-foreground">{employee.email}</td>
                    <td className="px-6 py-4 text-muted-foreground">{employee.phone}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {roleLabel(employee.role || '')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={(employee.status as any) || 'active'} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(employee)}>
                          <Pencil size={14} className="mr-1" /> Edit
                        </Button>
                        <Button
                          size="sm"
                          variant={employee.status === 'active' ? 'destructive' : 'default'}
                          onClick={() => toggleEmployeeStatus(employee.id, employee.status || 'active')}
                        >
                          {employee.status === 'active' ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteTarget(employee)}
                        >
                          <Trash2 size={14} />
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

      {/* Edit Dialog */}
      <Dialog open={!!editEmployee} onOpenChange={(open) => !open && setEditEmployee(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Full Name</label>
              <Input value={editForm.name} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Email</label>
              <Input type="email" value={editForm.email} onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Phone</label>
              <Input type="tel" value={editForm.phone} onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm((p) => ({ ...p, role: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-card px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="engineer">Engineer</option>
                  <option value="registrar">Registrar</option>
                  <option value="agent">Partner</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-card px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
            {editError && (
              <p className="text-sm text-destructive">{editError}</p>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setEditEmployee(null)}>Cancel</Button>
              <Button onClick={handleEditSave} disabled={editLoading}>
                {editLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Employee</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            Are you sure you want to delete <span className="font-semibold text-foreground">{deleteTarget?.name}</span>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteLoading}>
              {deleteLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
