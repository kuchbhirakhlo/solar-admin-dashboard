'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { ServiceRequest, ServiceNote, createServiceRequest, addServiceNote } from '@/lib/services/serviceRequests';
import { collection, query, where, orderBy, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Plus, Loader2, Send, Wrench, Calendar, User, ChevronDown, ChevronUp, MessageSquare, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function CustomerServiceRequestsPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState<{ id: string; name: string; phone: string } | null>(null);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [noteTexts, setNoteTexts] = useState<Record<string, string>>({});

  // New request form
  const [formType, setFormType] = useState<'Maintenance' | 'Repair' | 'Inspection'>('Maintenance');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formDescription, setFormDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const customerId = sessionStorage.getItem('customerId');
    const customerUid = sessionStorage.getItem('customerUid');
    const customerName = sessionStorage.getItem('customerName');
    const customerPhone = sessionStorage.getItem('customerPhone');

    if (!customerId && !customerUid) {
      router.push('/auth/customer-login');
      return;
    }

    setCustomer({
      id: customerId || customerUid || '',
      name: customerName || 'Customer',
      phone: customerPhone || '',
    });

    const loadRequests = async () => {
      try {
        const requestsRef = collection(db, 'serviceRequests');
        
        // Try by customerId first, then by customerUid
        let q = query(
          requestsRef,
          where('customerId', '==', (customerId || customerUid)),
          orderBy('createdAt', 'desc')
        );
        
        let snapshot = await getDocs(q);
        
        if (snapshot.empty && customerUid && customerId !== customerUid) {
          q = query(
            requestsRef,
            where('customerUid', '==', customerUid),
            orderBy('createdAt', 'desc')
          );
          snapshot = await getDocs(q);
        }
        
        const requests = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ServiceRequest[];
        
        setServiceRequests(requests);
      } catch (err) {
        console.error('Failed to load service requests:', err);
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
  }, [router]);

  const handleCreateRequest = async () => {
    if (!customer || !formDescription.trim()) {
      setFormError('Please provide a description');
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      await createServiceRequest({
        customerId: customer.id,
        customerName: customer.name,
        customerPhone: customer.phone,
        type: formType,
        priority: 'medium',
        status: 'pending',
        date: formDate,
        assignedEngineer: '',
        assignedEngineerId: '',
        description: formDescription.trim(),
        createdBy: 'customer',
        customerUid: sessionStorage.getItem('customerUid') || customer.id,
      });

      // Reset form and refresh
      setShowForm(false);
      setFormDescription('');
      setFormType('Maintenance');
      setFormDate(new Date().toISOString().split('T')[0]);

      // Refresh the list
      window.location.reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddNote = async (requestId: string) => {
    const text = noteTexts[requestId];
    if (!text?.trim()) return;

    try {
      await addServiceNote(requestId, {
        text: text.trim(),
        addedBy: customer?.name || 'Customer',
        addedByRole: 'customer',
      });
      setNoteTexts((prev) => ({ ...prev, [requestId]: '' }));
    } catch (err) {
      console.error('Failed to add note:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Service Requests</h1>
          <p className="text-muted-foreground mt-1">
            View and manage your service requests
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus size={16} className="mr-2" />
          {showForm ? 'Cancel' : 'New Request'}
        </Button>
      </div>

      {/* New Request Form */}
      {showForm && (
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Create New Service Request
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Service Type
              </label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value as any)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              >
                <option value="Maintenance">Maintenance</option>
                <option value="Repair">Repair</option>
                <option value="Inspection">Inspection</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Preferred Date
              </label>
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Description
              </label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground resize-none"
                placeholder="Describe the issue or service needed..."
              />
            </div>

            {formError && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                <p className="text-sm text-red-600">{formError}</p>
              </div>
            )}

            <Button onClick={handleCreateRequest} disabled={submitting}>
              {submitting && <Loader2 size={16} className="animate-spin mr-2" />}
              Submit Request
            </Button>
          </div>
        </div>
      )}

      {/* Service Requests List */}
      {serviceRequests.length === 0 && !showForm ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <Wrench size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No Service Requests
          </h3>
          <p className="text-muted-foreground mb-4">
            You haven't submitted any service requests yet.
          </p>
          <Button onClick={() => setShowForm(true)}>
            <Plus size={16} className="mr-2" />
            Create Your First Request
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {serviceRequests
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((request) => (
              <div
                key={request.id}
                className="rounded-lg border border-border bg-card overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-foreground">
                          {request.type}
                        </h3>
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                          {request.priority || 'medium'} priority
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {request.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <User size={14} />
                          {request.assignedEngineer || 'Not assigned yet'}
                        </span>
                      </div>
                    </div>
                    <StatusBadge status={request.status as any} />
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">
                    {request.description}
                  </p>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setExpandedId(expandedId === request.id ? null : request.id!)}
                    >
                      <MessageSquare size={14} className="mr-1" />
                      Notes ({(request.notes || []).length})
                    </Button>
                  </div>
                </div>

                {/* Expanded Notes Section */}
                {expandedId === request.id && (
                  <div className="border-t border-border bg-muted/20 p-6">
                    <h4 className="text-sm font-semibold text-foreground mb-4">
                      Activity & Notes
                    </h4>

                    <div className="flex gap-2 mb-4">
                      <input
                        placeholder="Add a note..."
                        value={noteTexts[request.id!] || ''}
                        onChange={(e) =>
                          setNoteTexts((prev) => ({ ...prev, [request.id!]: e.target.value }))
                        }
                        onKeyDown={(e) => e.key === 'Enter' && handleAddNote(request.id!)}
                        className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleAddNote(request.id!)}
                        disabled={!noteTexts[request.id!]?.trim()}
                      >
                        <Send size={14} />
                      </Button>
                    </div>

                    {(request.notes || []).length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-3">
                        No notes yet
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {request.notes!.map((note: ServiceNote) => (
                          <div key={note.id} className="rounded-lg bg-card border border-border p-3">
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
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}