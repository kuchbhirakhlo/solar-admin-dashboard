'use client';

import { useState, use } from 'react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { Mail, Phone, MapPin, Calendar, Zap, FileText } from 'lucide-react';
import { Customer, updateCustomer, deleteCustomer } from '@/lib/services/customers';
import { useFirestoreDocRealtime } from '@/lib/hooks/useFirestore';
import { ProjectStatusBar, ProjectStatus } from '@/components/dashboard/project-status-bar';
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
  const { data: customerData, loading, error } = useFirestoreDocRealtime<Customer>('customers', id);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleStatusChange = async (newStatus: ProjectStatus) => {
    if (updatingStatus) return;
    setUpdatingStatus(true);
    setActionError(null);

    try {
      await updateCustomer(id, { projectStatus: newStatus });
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to update project status');
    } finally {
      setUpdatingStatus(false);
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
          <Button
            variant="outline"
            className="text-red-600 hover:bg-red-50"
            onClick={() => setDeleteDialogOpen(true)}
          >
            Delete
          </Button>
        }
      />

          {/* Project Status */}
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                Project Status
              </h2>
              {updatingStatus && (
                <span className="text-sm text-muted-foreground">Updating...</span>
              )}
            </div>
            {actionError && (
              <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-800">
                {actionError}
              </div>
            )}
            <ProjectStatusBar
              currentStatus={customer.projectStatus || 'registration'}
              onChange={handleStatusChange}
            />
            <p className="mt-4 text-xs text-muted-foreground">
              Click on any stage to update the project status.
            </p>
          </div>

      {/* Main Content */}
      <div className="px-6 py-6">
        <div className="space-y-6">
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
                {customer.documents.cancelledCheque && (
                  <a
                    href={customer.documents.cancelledCheque}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-muted transition-colors"
                  >
                    <FileText size={20} className="text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Cancelled Cheque</p>
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
                {customer.documents.propertyDocuments && (
                  <a
                    href={customer.documents.propertyDocuments}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-muted transition-colors"
                  >
                    <FileText size={20} className="text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Property Documents</p>
                      <p className="text-xs text-muted-foreground">View Document</p>
                    </div>
                  </a>
                )}
                {customer.documents.rooftopPhotos && (
                  <a
                    href={customer.documents.rooftopPhotos}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-muted transition-colors"
                  >
                    <FileText size={20} className="text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Rooftop Photos</p>
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
        </div>
      </div>

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
              className="bg-red-600 text-foreground hover:bg-red-700"
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
