'use client';

import { use, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { Input } from '@/components/ui/input';
import { Calendar, User, Wrench, ArrowLeft, Loader2, Send, AlertTriangle } from 'lucide-react';
import { ServiceRequest, ServiceNote, assignEngineer, updateServiceStatus, addServiceNote } from '@/lib/services/serviceRequests';
import { addServiceAssignmentNotification } from '@/lib/services/notifications';
import { useFirestoreDocRealtime } from '@/lib/hooks/useFirestore';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Engineer {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
}

export default function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: service, loading, error } = useFirestoreDocRealtime<ServiceRequest>('serviceRequests', id);

  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [showAssignPanel, setShowAssignPanel] = useState(false);
  const [selectedEngineerId, setSelectedEngineerId] = useState('');
  const [assigning, setAssigning] = useState(false);

  const [statusUpdating, setStatusUpdating] = useState(false);

  const [noteText, setNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    fetchEngineers();
  }, []);

  const fetchEngineers = async () => {
    try {
      const engineersRef = collection(db, 'engineers');
      const q = query(engineersRef, where('status', '==', 'active'));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Engineer[];
      setEngineers(list);
    } catch (err) {
      console.error('Failed to load engineers:', err);
    }
  };

  const handleAssignEngineer = async () => {
    if (!selectedEngineerId) return;
    setAssigning(true);
    setActionError(null);
    try {
      const engineer = engineers.find((e) => e.id === selectedEngineerId);
      if (!engineer) return;
      await assignEngineer(id, engineer.name, engineer.id);
      
      // Send notification to the engineer
      await addServiceAssignmentNotification(
        engineer.id,
        engineer.name,
        id,
        service?.customerName || 'Customer',
        service?.type || 'Service'
      );
      
      setShowAssignPanel(false);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to assign engineer');
    } finally {
      setAssigning(false);
    }
  };

  const handleUpdateStatus = async (newStatus: ServiceRequest['status']) => {
    setStatusUpdating(true);
    setActionError(null);
    try {
      await updateServiceStatus(id, newStatus);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    setAddingNote(true);
    setActionError(null);
    try {
      await addServiceNote(id, {
        text: noteText.trim(),
        addedBy: 'Admin',
        addedByRole: 'admin',
      });
      setNoteText('');
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to add note');
    } finally {
      setAddingNote(false);
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatTimestamp = (value: any) => {
    if (!value) return '';
    if (typeof value === 'object' && 'seconds' in value) {
      return new Date(value.seconds * 1000).toLocaleString();
    }
    return value;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading service details...</p>
      </div>
    );
  }

  if (error || !service || Array.isArray(service)) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-red-600">Error loading service details</p>
      </div>
    );
  }

  const notes = service.notes || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={`${service.customerName} - ${service.type}`}
        description={`Service Request #${service.id?.slice(0, 8)}`}
        breadcrumbs={[
          { label: 'Services', href: '/dashboard/services' },
          { label: service.customerName },
        ]}
        action={
          <Link href="/dashboard/services">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft size={16} />
              Back to Services
            </Button>
          </Link>
        }
      />

      {/* Action Error */}
      {actionError && (
        <div className="px-6">
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-600" />
            <p className="text-sm text-red-600">{actionError}</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="px-6 py-6 grid gap-6 lg:grid-cols-3">
        {/* Left Column - Details & Notes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Service Information */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-6 text-lg font-semibold text-foreground">
              Service Information
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Wrench size={20} className="text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Service Type</p>
                  <p className="font-medium text-foreground">{service.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User size={20} className="text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-medium text-foreground">{service.customerName}</p>
                  {service.customerPhone && (
                    <p className="text-xs text-muted-foreground">{service.customerPhone}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar size={20} className="text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium text-foreground">{service.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User size={20} className="text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Assigned Engineer</p>
                  <p className="font-medium text-foreground">
                    {service.assignedEngineer || 'Not assigned'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="mt-1">
                    <StatusBadge status={service.status as any} />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Priority</p>
                  <span className={`mt-1 inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(service.priority)}`}>
                    {service.priority || 'medium'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-6 text-lg font-semibold text-foreground">
              Description
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {service.description || 'No description provided'}
            </p>
          </div>

          {/* Notes / Activity Log */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-6 text-lg font-semibold text-foreground">
              Activity & Notes
            </h2>

            {/* Add Note */}
            <div className="flex gap-2 mb-6">
              <Input
                placeholder="Add a note or update..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
              />
              <Button onClick={handleAddNote} disabled={addingNote || !noteText.trim()}>
                {addingNote ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </Button>
            </div>

            {/* Notes List */}
            {notes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No notes or activity recorded yet
              </p>
            ) : (
              <div className="space-y-3">
                {notes.map((note: ServiceNote) => (
                  <div key={note.id} className="rounded-lg bg-muted/30 p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground">
                        {note.addedBy}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {note.timestamp ? new Date(note.timestamp).toLocaleString() : ''}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{note.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Actions */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground mb-3">Current Status</p>
            <div className="mb-4">
              <StatusBadge status={service.status as any} />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase">
                Update Status
              </p>
              <Button
                variant="outline"
                className="w-full justify-start"
                disabled={statusUpdating || service.status === 'in-progress'}
                onClick={() => handleUpdateStatus('in-progress')}
              >
                {statusUpdating && <Loader2 size={14} className="animate-spin mr-2" />}
                Mark In Progress
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-green-600"
                disabled={statusUpdating || service.status === 'completed'}
                onClick={() => handleUpdateStatus('completed')}
              >
                {statusUpdating && <Loader2 size={14} className="animate-spin mr-2" />}
                Mark Completed
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-red-600"
                disabled={statusUpdating || service.status === 'cancelled'}
                onClick={() => handleUpdateStatus('cancelled')}
              >
                {statusUpdating && <Loader2 size={14} className="animate-spin mr-2" />}
                Cancel Service
              </Button>
            </div>
          </div>

          {/* Assign Engineer */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-4 font-semibold text-foreground">
              Assigned Engineer
            </h3>

            {service.assignedEngineer ? (
              <div className="mb-4 p-3 rounded-lg bg-muted/30">
                <p className="font-medium text-foreground">{service.assignedEngineer}</p>
                {service.assignedEngineerId && (
                  <p className="text-xs text-muted-foreground">ID: {service.assignedEngineerId}</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mb-4">No engineer assigned</p>
            )}

            {!showAssignPanel ? (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowAssignPanel(true)}
              >
                {service.assignedEngineer ? 'Reassign Engineer' : 'Assign Engineer'}
              </Button>
            ) : (
              <div className="space-y-3">
                <select
                  value={selectedEngineerId}
                  onChange={(e) => setSelectedEngineerId(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                >
                  <option value="">Select engineer...</option>
                  {engineers.map((eng) => (
                    <option key={eng.id} value={eng.id}>
                      {eng.name} - {eng.phone}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleAssignEngineer}
                    disabled={assigning || !selectedEngineerId}
                  >
                    {assigning && <Loader2 size={14} className="animate-spin mr-1" />}
                    Confirm
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowAssignPanel(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Customer Info */}
          {service.customerPhone && (
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="mb-4 font-semibold text-foreground">
                Customer Contact
              </h3>
              <div className="space-y-2 text-sm">
                <p className="text-foreground">{service.customerName}</p>
                <p className="text-muted-foreground">{service.customerPhone}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}