'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { ServiceRequest, ServiceNote, updateServiceStatus, addServiceNote } from '@/lib/services/serviceRequests';
import { getServiceRequestsByEngineer } from '@/lib/services/serviceRequests';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Wrench, Loader2, Send, CheckCircle, XCircle, Clock, RefreshCw, MessageSquare } from 'lucide-react';

// Use the same interface from serviceRequests
// We need to import onSnapshot for real-time updates

export default function EngineerServiceRequestsPage() {
  const router = useRouter();
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [noteTexts, setNoteTexts] = useState<Record<string, string>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const engineerId = sessionStorage.getItem('engineerUid');
    const engineerName = sessionStorage.getItem('engineerName');

    if (!engineerId) {
      router.push('/auth/engineer-login');
      return;
    }

    // Try by engineer UID first, then by name
    const requestsRef = collection(db, 'serviceRequests');
    const q = query(
      requestsRef,
      where('assignedEngineerId', '==', engineerId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const requests = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ServiceRequest[];
        setServiceRequests(requests);
        setLoading(false);
        setError(null);
      },
      (err) => {
        // Fallback: try by engineer name
        if (engineerName) {
          const fallbackQ = query(
            requestsRef,
            where('assignedEngineer', '==', engineerName),
            orderBy('createdAt', 'desc')
          );
          const fallbackUnsub = onSnapshot(
            fallbackQ,
            (snapshot) => {
              const requests = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              })) as ServiceRequest[];
              setServiceRequests(requests);
              setLoading(false);
              setError(null);
            },
            (fallbackErr) => {
              setError('Failed to load service requests');
              setLoading(false);
            }
          );
          return fallbackUnsub;
        }
        setError('Failed to load service requests');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleUpdateStatus = async (id: string, status: ServiceRequest['status']) => {
    setUpdatingId(id);
    try {
      await updateServiceStatus(id, status);
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAddNote = async (requestId: string) => {
    const text = noteTexts[requestId];
    if (!text?.trim()) return;

    try {
      await addServiceNote(requestId, {
        text: text.trim(),
        addedBy: sessionStorage.getItem('engineerName') || 'Engineer',
        addedByRole: 'engineer',
      });
      setNoteTexts((prev) => ({ ...prev, [requestId]: '' }));
    } catch (err) {
      console.error('Failed to add note:', err);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle size={16} className="text-green-500" />;
      case 'in-progress': return <RefreshCw size={16} className="text-blue-500" />;
      case 'cancelled': return <XCircle size={16} className="text-red-500" />;
      default: return <Clock size={16} className="text-yellow-500" />;
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Service Requests</h1>
        <p className="text-muted-foreground mt-1">
          View and manage your assigned service requests
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-2xl font-bold text-foreground">{serviceRequests.length}</p>
          <p className="text-sm text-muted-foreground">Total Assigned</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-2xl font-bold text-yellow-600">
            {serviceRequests.filter((r) => r.status === 'pending').length}
          </p>
          <p className="text-sm text-muted-foreground">Pending</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-2xl font-bold text-blue-600">
            {serviceRequests.filter((r) => r.status === 'in-progress').length}
          </p>
          <p className="text-sm text-muted-foreground">In Progress</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-2xl font-bold text-green-600">
            {serviceRequests.filter((r) => r.status === 'completed').length}
          </p>
          <p className="text-sm text-muted-foreground">Completed</p>
        </div>
      </div>

      {/* Service Requests List */}
      {serviceRequests.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <Wrench size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No Service Requests Assigned
          </h3>
          <p className="text-muted-foreground">
            You don't have any service requests assigned to you yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {serviceRequests.map((request) => (
            <div
              key={request.id}
              className="rounded-lg border border-border bg-card overflow-hidden"
            >
              {/* Main Card */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-foreground">
                        {request.customerName}
                      </h3>
                      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium border"
                        style={{ 
                          backgroundColor: request.type === 'Installation' ? '#dcfce7' : 
                            request.type === 'Repair' ? '#fee2e2' : 
                            request.type === 'Maintenance' ? '#dbeafe' : '#f3e8ff',
                          color: request.type === 'Installation' ? '#166534' : 
                            request.type === 'Repair' ? '#991b1b' : 
                            request.type === 'Maintenance' ? '#1e40af' : '#6b21a8'
                        }}
                      >
                        {request.type}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {request.customerPhone || ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(request.status)}
                    <StatusBadge status={request.status as any} />
                  </div>
                </div>

                {/* Priority & Date */}
                <div className="flex items-center gap-3 mb-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(request.priority)}`}>
                    {request.priority || 'medium'} priority
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {request.date}
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {request.description}
                </p>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {request.status === 'pending' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-blue-600"
                      onClick={() => handleUpdateStatus(request.id!, 'in-progress')}
                      disabled={updatingId === request.id}
                    >
                      {updatingId === request.id ? (
                        <Loader2 size={14} className="animate-spin mr-1" />
                      ) : (
                        <RefreshCw size={14} className="mr-1" />
                      )}
                      Start Work
                    </Button>
                  )}
                  {request.status === 'in-progress' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600"
                      onClick={() => handleUpdateStatus(request.id!, 'completed')}
                      disabled={updatingId === request.id}
                    >
                      {updatingId === request.id ? (
                        <Loader2 size={14} className="animate-spin mr-1" />
                      ) : (
                        <CheckCircle size={14} className="mr-1" />
                      )}
                      Mark Completed
                    </Button>
                  )}
                  {(request.status === 'pending' || request.status === 'in-progress') && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600"
                      onClick={() => handleUpdateStatus(request.id!, 'cancelled')}
                      disabled={updatingId === request.id}
                    >
                      {updatingId === request.id ? (
                        <Loader2 size={14} className="animate-spin mr-1" />
                      ) : (
                        <XCircle size={14} className="mr-1" />
                      )}
                      Cancel
                    </Button>
                  )}
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

                  {/* Add Note */}
                  <div className="flex gap-2 mb-4">
                    <Input
                      placeholder="Add a note..."
                      value={noteTexts[request.id!] || ''}
                      onChange={(e) =>
                        setNoteTexts((prev) => ({ ...prev, [request.id!]: e.target.value }))
                      }
                      onKeyDown={(e) => e.key === 'Enter' && handleAddNote(request.id!)}
                    />
                    <Button
                      size="sm"
                      onClick={() => handleAddNote(request.id!)}
                      disabled={!noteTexts[request.id!]?.trim()}
                    >
                      <Send size={14} />
                    </Button>
                  </div>

                  {/* Notes List */}
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
                              {note.addedByRole === 'engineer' && (
                                <span className="ml-1 text-xs text-blue-500">(You)</span>
                              )}
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