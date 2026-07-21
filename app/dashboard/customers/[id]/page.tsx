'use client';

import { useEffect, useState, use } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/layout/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { Mail, Phone, MapPin, Calendar, Zap, FileText } from 'lucide-react';
import { Customer, updateCustomer, deleteCustomer } from '@/lib/services/customers';
import { useFirestoreDoc } from '@/lib/hooks/useFirestore';
import { db } from '@/lib/firebase';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';

function formatTimestamp(value: string | { seconds: number; nanoseconds: number } | undefined | null): string {
  if (!value) return 'N/A';
  if (typeof value === 'object' && 'seconds' in value) {
    return new Date(value.seconds * 1000).toLocaleDateString();
  }
  if (typeof value === 'string' && value.length > 0) {
    const date = new Date(value);
    return isNaN(date.getTime()) ? value : date.toLocaleDateString();
  }
  return 'N/A';
}

export default function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: customerData, loading, error } = useFirestoreDoc<Customer>('customers', id);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    systemSize: '',
    installationDate: '',
    status: 'pending' as 'pending' | 'active' | 'inactive',
    alternatePhone: '',
    connectionNumber: '',
    monthlyUsage: '',
  });

  // Populate edit form when customer data loads or dialog opens
  useEffect(() => {
    if (customerData && !Array.isArray(customerData) && editDialogOpen) {
      setEditForm({
        name: customerData.name || '',
        email: customerData.email || '',
        phone: customerData.phone || '',
        address: customerData.address || '',
        city: customerData.city || '',
        state: customerData.state || '',
        zipCode: customerData.zipCode || '',
        systemSize: customerData.systemSize?.toString() || '',
        installationDate: customerData.installationDate && typeof customerData.installationDate === 'object'
          ? new Date((customerData.installationDate as unknown as { seconds: number }).seconds * 1000).toISOString().split('T')[0]
          : typeof customerData.installationDate === 'string'
            ? customerData.installationDate.split('T')[0] || customerData.installationDate
            : '',
        status: (customerData.status as 'pending' | 'active' | 'inactive') || 'pending',
        alternatePhone: customerData.alternatePhone || '',
        connectionNumber: customerData.connectionNumber || '',
        monthlyUsage: customerData.monthlyUsage?.toString() || '',
      });
      setActionError(null);
    }
  }, [customerData, editDialogOpen]);

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveEdit = async () => {
    if (!customerData || Array.isArray(customerData)) return;
    setSaving(true);
    setActionError(null);

    try {
      await updateCustomer(id, {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        address: editForm.address,
        city: editForm.city,
        state: editForm.state,
        zipCode: editForm.zipCode,
        systemSize: parseFloat(editForm.systemSize) || 0,
        installationDate: editForm.installationDate,
        status: editForm.status,
        alternatePhone: editForm.alternatePhone || undefined,
        connectionNumber: editForm.connectionNumber || undefined,
        monthlyUsage: parseFloat(editForm.monthlyUsage) || 0,
      });
      setEditDialogOpen(false);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to update customer');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setActionError(null);

    try {
      await deleteCustomer(id);
      router.push('/dashboard/customers');
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to delete customer');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading customer details...</p>
      </div>
    );
  }

  if (error || !customerData || Array.isArray(customerData)) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-red-600">Error loading customer details</p>
      </div>
    );
  }

  const customer = customerData;

  const fullAddress = [customer.address, customer.city, customer.state, customer.zipCode]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={customer.name}
        description="Customer details and account information"
        breadcrumbs={[
          { label: 'Customers', href: '/dashboard/customers' },
          { label: customer.name },
        ]}
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEditDialogOpen(true)}>
              Edit
            </Button>
            <Button
              variant="outline"
              className="text-red-600 hover:bg-red-50"
              onClick={() => setDeleteDialogOpen(true)}
            >
              Delete
            </Button>
          </div>
        }
      />

      {/* Main Content */}
      <div className="px-6 py-6 grid gap-6 lg:grid-cols-3">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-6 text-lg font-semibold text-foreground">
              Contact Information
            </h2>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail size={20} className="text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium text-foreground">{customer.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={20} className="text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Mobile Number</p>
                  <p className="font-medium text-foreground">{customer.phone}</p>
                </div>
              </div>
              {customer.alternatePhone && (
                <div className="flex items-center gap-3">
                  <Phone size={20} className="text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Alternate Mobile Number</p>
                    <p className="font-medium text-foreground">{customer.alternatePhone}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <MapPin size={20} className="text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium text-foreground">{fullAddress}</p>
                </div>
              </div>
            </div>
          </div>

          {/* System Information */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-6 text-lg font-semibold text-foreground">
              Solar System Information
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Connection Number</p>
                  <p className="mt-1 font-medium text-foreground">{customer.connectionNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Plant Size</p>
                  <p className="mt-1 flex items-center gap-2 font-medium text-foreground">
                    <Zap size={18} className="text-primary" />
                    {customer.systemSize} kW
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Installation Date</p>
                  <p className="mt-1 flex items-center gap-2 font-medium text-foreground">
                    <Calendar size={18} className="text-primary" />
                    {formatTimestamp(customer.installationDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Usage</p>
                  <p className="mt-1 font-medium text-foreground">{customer.monthlyUsage ? `${customer.monthlyUsage} kWh` : 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="mt-1">
                    <StatusBadge status={customer.status} />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Customer Since</p>
                  <p className="mt-1 font-medium text-foreground">{formatTimestamp(customer.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Documents */}
          {customer.documents && (
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="mb-6 text-lg font-semibold text-foreground">
                Documents
              </h2>

              <div className="grid gap-3 md:grid-cols-2">
                {customer.documents.aadhaarFront && (
                  <a
                    href={customer.documents.aadhaarFront}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-muted transition-colors"
                  >
                    <FileText size={20} className="text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Aadhaar Card (Front)</p>
                      <p className="text-xs text-muted-foreground">View Document</p>
                    </div>
                  </a>
                )}
                {customer.documents.aadhaarBack && (
                  <a
                    href={customer.documents.aadhaarBack}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-muted transition-colors"
                  >
                    <FileText size={20} className="text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Aadhaar Card (Back)</p>
                      <p className="text-xs text-muted-foreground">View Document</p>
                    </div>
                  </a>
                )}
                {customer.documents.panCard && (
                  <a
                    href={customer.documents.panCard}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-muted transition-colors"
                  >
                    <FileText size={20} className="text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">PAN Card</p>
                      <p className="text-xs text-muted-foreground">View Document</p>
                    </div>
                  </a>
                )}
                {customer.documents.bankPassbook && (
                  <a
                    href={customer.documents.bankPassbook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-muted transition-colors"
                  >
                    <FileText size={20} className="text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Bank Passbook</p>
                      <p className="text-xs text-muted-foreground">View Document</p>
                    </div>
                  </a>
                )}
                {customer.documents.electricityBill && (
                  <a
                    href={customer.documents.electricityBill}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-muted transition-colors"
                  >
                    <FileText size={20} className="text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Electricity Bill</p>
                      <p className="text-xs text-muted-foreground">View Document</p>
                    </div>
                  </a>
                )}
                {customer.documents.gpsPhoto && (
                  <a
                    href={customer.documents.gpsPhoto}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-muted transition-colors"
                  >
                    <FileText size={20} className="text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">GPS Photo</p>
                      <p className="text-xs text-muted-foreground">View Document</p>
                    </div>
                  </a>
                )}
                {customer.documents.ownershipDocument && (
                  <a
                    href={customer.documents.ownershipDocument}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-muted transition-colors"
                  >
                    <FileText size={20} className="text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Ownership Document</p>
                      <p className="text-xs text-muted-foreground">View Document</p>
                    </div>
                  </a>
                )}
              </div>
              {(!customer.documents || Object.keys(customer.documents).length === 0) && (
                <p className="text-sm text-muted-foreground">No documents uploaded</p>
              )}
            </div>
          )}

          {/* Recent Services */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-6 text-lg font-semibold text-foreground">
              Recent Services
            </h2>

            <div className="space-y-3">
              {[
                { id: 'SVC001', type: 'Installation', status: 'completed' },
                { id: 'SVC002', type: 'Maintenance', status: 'completed' },
                { id: 'SVC003', type: 'Inspection', status: 'completed' },
              ].map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted transition-colors"
                >
                  <div>
                    <p className="font-medium text-foreground">{service.id}</p>
                    <p className="text-sm text-muted-foreground">{service.type}</p>
                  </div>
                  <StatusBadge status={service.status as any} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Summary */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">Status</p>
            <div className="mt-3">
              <StatusBadge status={customer.status} />
            </div>
          </div>

          {/* Financial Summary */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-4 font-semibold text-foreground">
              Financial Summary
            </h3>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="mt-1 flex items-center gap-2 text-2xl font-bold text-foreground">
                  <span className="text-2xl font-bold text-green-600">₹</span>
                  {customer.totalSpent || 0}
                </p>
              </div>

              <div className="border-t border-border pt-3">
                <p className="text-sm text-muted-foreground">
                  Average Monthly Cost
                </p>
                <p className="mt-1 text-lg font-semibold text-foreground">
                  ₹185.50
                </p>
              </div>

              <div className="border-t border-border pt-3">
                <p className="text-sm text-muted-foreground">
                  Energy Savings (Annual)
                </p>
                <p className="mt-1 text-lg font-semibold text-green-600">
                  ₹2,450
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-4 font-semibold text-foreground">
              Quick Actions
            </h3>

            <div className="space-y-2">
              <Button variant="outline" className="w-full">
                Create Service Request
              </Button>
              <Button variant="outline" className="w-full">
                Send Invoice
              </Button>
              <Button variant="outline" className="w-full">
                Schedule Maintenance
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Customer Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>
              Update customer details below.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {actionError && (
              <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">
                {actionError}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Full Name
              </label>
              <Input
                name="name"
                value={editForm.name}
                onChange={handleEditChange}
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Mobile Number
                </label>
                <Input
                  name="phone"
                  type="tel"
                  value={editForm.phone}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Alternate Mobile Number
                </label>
                <Input
                  name="alternatePhone"
                  type="tel"
                  value={editForm.alternatePhone}
                  onChange={handleEditChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email
              </label>
              <Input
                name="email"
                type="email"
                value={editForm.email}
                onChange={handleEditChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Address
              </label>
              <Input
                name="address"
                value={editForm.address}
                onChange={handleEditChange}
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  City
                </label>
                <Input
                  name="city"
                  value={editForm.city}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  State
                </label>
                <Input
                  name="state"
                  value={editForm.state}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  ZIP Code
                </label>
                <Input
                  name="zipCode"
                  value={editForm.zipCode}
                  onChange={handleEditChange}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Connection Number
                </label>
                <Input
                  name="connectionNumber"
                  value={editForm.connectionNumber}
                  onChange={handleEditChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Plant Size (KW)
                </label>
                <Input
                  name="systemSize"
                  type="number"
                  step="0.1"
                  value={editForm.systemSize}
                  onChange={handleEditChange}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Installation Date
                </label>
                <Input
                  name="installationDate"
                  type="date"
                  value={editForm.installationDate}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Monthly Usage (kWh)
                </label>
                <Input
                  name="monthlyUsage"
                  type="number"
                  value={editForm.monthlyUsage}
                  onChange={handleEditChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Status
              </label>
              <select
                name="status"
                value={editForm.status}
                onChange={handleEditChange}
                className="w-full rounded-lg border border-border bg-card px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleSaveEdit}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Customer</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{customer.name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {actionError && (
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">
              {actionError}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete Customer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}