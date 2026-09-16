'use client';

import { useState, use, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/layout/page-header';
import { Mail, Phone, MapPin, Calendar, Zap, FileText, CreditCard, CheckCircle, XCircle, Clock, Pencil, X, Check } from 'lucide-react';
import { Customer, updateCustomer, deleteCustomer } from '@/lib/services/customers';
import { useFirestoreDocRealtime, useFirestoreCollectionRealtime } from '@/lib/hooks/useFirestore';
import { User } from '@/lib/services/users';
import { where } from 'firebase/firestore';
import { ProjectStatusBar, ProjectStatus } from '@/components/dashboard/project-status-bar';
import { doc, onSnapshot, Timestamp } from 'firebase/firestore';
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
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ source?: string }>;
}) {
  const { id } = use(params);
  const { source } = use(searchParams);
  const profileOnly = source === 'users';
  const router = useRouter();
  const { data: customerData, loading, error } = useFirestoreDocRealtime<Customer>(profileOnly ? 'users' : 'customers', id);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionDoc | null | undefined>(undefined);

  // Edit contact info
  const [editingContact, setEditingContact] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', alternatePhone: '', address: '', city: '', state: '', zipCode: '', assignedAgentId: '', assignedAgentName: '' });
  const [savingContact, setSavingContact] = useState(false);

  // Edit solar info
  const [editingSolar, setEditingSolar] = useState(false);
  const [solarForm, setSolarForm] = useState({ connectionNumber: '', systemSize: '', installationDate: '', monthlyUsage: '' });
  const [savingSolar, setSavingSolar] = useState(false);

  // Agent list for assign dropdown
  const { data: agents } = useFirestoreCollectionRealtime<User>('users', [
    where('role', 'in', ['agent', 'partner']),
    where('status', '==', 'active'),
  ]);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'subscriptions', id), (snap) => {
      setSubscription(snap.exists() ? (snap.data() as SubscriptionDoc) : null);
    });
    return () => unsub();
  }, [id]);

  const handleStatusChange = async (newStatus: ProjectStatus) => {
    if (profileOnly || updatingStatus) return;
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
    if (profileOnly) return;
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

  const openEditContact = () => {
    if (!customerData || Array.isArray(customerData)) return;
    const c = customerData as Customer;
    setContactForm({
      name: c.name || '',
      email: c.email || '',
      phone: c.phone || '',
      alternatePhone: c.alternatePhone || '',
      address: c.address || '',
      city: c.city || '',
      state: c.state || '',
      zipCode: c.zipCode || '',
      assignedAgentId: c.assignedAgentId || '',
      assignedAgentName: c.assignedAgentName || '',
    });
    setEditingContact(true);
  };

  const saveContact = async () => {
    setSavingContact(true);
    try {
      const agentName = agents?.find((a) => a.id === contactForm.assignedAgentId)?.name || contactForm.assignedAgentName;
      const payload = { ...contactForm, assignedAgentName: agentName };
      if (profileOnly) {
        // Customer registered via app — stored in users collection
        const { updateFirestoreDoc } = await import('@/lib/hooks/useFirestore');
        await updateFirestoreDoc('users', id, payload);
      } else {
        await updateCustomer(id, payload);
      }
      setEditingContact(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingContact(false);
    }
  };

  const openEditSolar = () => {
    if (!customerData || Array.isArray(customerData)) return;
    const c = customerData as Customer;
    const instDate = typeof c.installationDate === 'string' ? c.installationDate : '';
    setSolarForm({
      connectionNumber: c.connectionNumber || '',
      systemSize: c.systemSize?.toString() || '',
      installationDate: instDate,
      monthlyUsage: c.monthlyUsage?.toString() || '',
    });
    setEditingSolar(true);
  };

  const saveSolar = async () => {
    setSavingSolar(true);
    try {
      const payload: Partial<Customer> = {
        connectionNumber: solarForm.connectionNumber || '',
        installationDate: solarForm.installationDate || '',
      };
      if (solarForm.systemSize !== '') payload.systemSize = Number(solarForm.systemSize);
      if (solarForm.monthlyUsage !== '') payload.monthlyUsage = Number(solarForm.monthlyUsage);
      await updateCustomer(id, payload);
      setEditingSolar(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingSolar(false);
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
          !profileOnly && <Button
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
              onChange={profileOnly ? undefined : handleStatusChange}
              readonly={profileOnly}
            />
            {!profileOnly && <p className="mt-4 text-xs text-muted-foreground">
              Click on any stage to update the project status.
            </p>}
          </div>

      {/* Main Content */}
      <div className="px-6 py-6">
        <div className="space-y-6">
          {/* Contact Information */}
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Contact Information</h2>
              {!editingContact && (
                <Button variant="ghost" size="sm" onClick={openEditContact}>
                  <Pencil size={14} className="mr-1" /> Edit
                </Button>
              )}
            </div>

            {editingContact ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Full Name</label>
                    <Input value={contactForm.name} onChange={(e) => setContactForm((p) => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Email</label>
                    <Input type="email" value={contactForm.email} onChange={(e) => setContactForm((p) => ({ ...p, email: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Phone</label>
                    <Input type="tel" value={contactForm.phone} onChange={(e) => setContactForm((p) => ({ ...p, phone: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Alternate Phone</label>
                    <Input type="tel" value={contactForm.alternatePhone} onChange={(e) => setContactForm((p) => ({ ...p, alternatePhone: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Address</label>
                  <Input value={contactForm.address} onChange={(e) => setContactForm((p) => ({ ...p, address: e.target.value }))} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground">City</label>
                    <Input value={contactForm.city} onChange={(e) => setContactForm((p) => ({ ...p, city: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">State</label>
                    <Input value={contactForm.state} onChange={(e) => setContactForm((p) => ({ ...p, state: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Pin Code</label>
                    <Input value={contactForm.zipCode} onChange={(e) => setContactForm((p) => ({ ...p, zipCode: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Assign Agent</label>
                  <select
                    value={contactForm.assignedAgentId}
                    onChange={(e) => setContactForm((p) => ({ ...p, assignedAgentId: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-card px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">— No agent assigned —</option>
                    {agents?.map((a) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <Button variant="outline" size="sm" onClick={() => setEditingContact(false)}>
                    <X size={14} className="mr-1" /> Cancel
                  </Button>
                  <Button size="sm" onClick={saveContact} disabled={savingContact}>
                    <Check size={14} className="mr-1" /> {savingContact ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>
            ) : (
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
                {customer.assignedAgentName && (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs text-primary font-bold">A</span>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Assigned Agent</p>
                      <p className="font-medium text-foreground">{customer.assignedAgentName}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* System Information */}
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Solar System Information</h2>
              {!profileOnly && !editingSolar && (
                <Button variant="ghost" size="sm" onClick={openEditSolar}>
                  <Pencil size={14} className="mr-1" /> Edit
                </Button>
              )}
            </div>

            {editingSolar ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Connection Number</label>
                    <Input value={solarForm.connectionNumber} onChange={(e) => setSolarForm((p) => ({ ...p, connectionNumber: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Plant Size (kW)</label>
                    <Input type="number" step="0.1" value={solarForm.systemSize} onChange={(e) => setSolarForm((p) => ({ ...p, systemSize: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Installation Date</label>
                    <Input type="date" value={solarForm.installationDate} onChange={(e) => setSolarForm((p) => ({ ...p, installationDate: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Monthly Usage (kWh)</label>
                    <Input type="number" value={solarForm.monthlyUsage} onChange={(e) => setSolarForm((p) => ({ ...p, monthlyUsage: e.target.value }))} />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <Button variant="outline" size="sm" onClick={() => setEditingSolar(false)}>
                    <X size={14} className="mr-1" /> Cancel
                  </Button>
                  <Button size="sm" onClick={saveSolar} disabled={savingSolar}>
                    <Check size={14} className="mr-1" /> {savingSolar ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>
            ) : (
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
            )}
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


          {/* Subscription */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
              <CreditCard size={20} className="text-primary" />
              Subscription
            </h2>
            {subscription === undefined ? (
              <div className="h-5 w-32 animate-pulse rounded bg-muted" />
            ) : subscription === null ? (
              <p className="text-sm text-muted-foreground">No active subscription</p>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Plan</p>
                    <p className="font-semibold text-foreground capitalize">{subscription.planName || subscription.plan || '—'}</p>
                  </div>
                  <SubscriptionStatusBadge status={subscription.status} />
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Start Date</p>
                    <p className="font-medium text-foreground">{formatTs(subscription.startDate)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Renewal Date</p>
                    <p className="font-medium text-foreground">{formatTs(subscription.renewalDate)}</p>
                  </div>
                  {subscription.price != null && (
                    <div>
                      <p className="text-muted-foreground">Amount</p>
                      <p className="font-medium text-foreground">
                        ₹{subscription.price}/{subscription.period === 'yearly' ? 'yr' : 'mo'}
                      </p>
                    </div>
                  )}
                  {subscription.latestPaymentId && (
                    <div>
                      <p className="text-muted-foreground">Payment ID</p>
                      <p className="font-mono text-xs text-foreground truncate">{subscription.latestPaymentId}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
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

// ── Subscription helpers ──────────────────────────────────────────────────────

interface SubscriptionDoc {
  plan?: string;
  planName?: string;
  planId?: string;
  status?: string;
  price?: number;
  period?: string;
  startDate?: Timestamp | null;
  renewalDate?: Timestamp | null;
  latestPaymentId?: string;
}

function formatTs(ts: Timestamp | null | undefined): string {
  if (!ts) return '—';
  return ts.toDate().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function SubscriptionStatusBadge({ status }: { status?: string }) {
  if (!status) return null;
  const s = status.toLowerCase();
  const cfg =
    s === 'active'
      ? { icon: <CheckCircle size={14} />, label: 'Active', cls: 'bg-green-500/10 text-green-600' }
      : s === 'expired'
      ? { icon: <XCircle size={14} />, label: 'Expired', cls: 'bg-red-500/10 text-red-500' }
      : { icon: <Clock size={14} />, label: status, cls: 'bg-yellow-500/10 text-yellow-600' };

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.cls}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
}
