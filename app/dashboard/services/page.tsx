'use client';

import { useState } from 'react';
import { useFirestoreCollectionRealtime } from '@/lib/hooks/useFirestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/layout/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { Plus, ChevronRight, Calendar, User, Search } from 'lucide-react';
import { ServiceRequest } from '@/lib/services/serviceRequests';
import Link from 'next/link';

const STATUS_FILTERS = ['All', 'pending', 'in-progress', 'completed', 'cancelled'];

export default function ServicesPage() {
  const { data: services, loading, error } = useFirestoreCollectionRealtime<ServiceRequest>('serviceRequests');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filtered = services?.filter((s) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      (s.customerName || '').toLowerCase().includes(q) ||
      (s.customerPhone || '').includes(q) ||
      (s.customerId || '').toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading service requests...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-red-500">Failed to load service requests: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Service Requests"
        description="Track and manage all service requests"
        action={
          <Link href="/dashboard/services/new">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus size={20} className="mr-2" />
              New Service Request
            </Button>
          </Link>
        }
      />

      {/* Search & Filter */}
      <div className="px-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                statusFilter === s
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border hover:border-primary/50'
              }`}
            >
              {s === 'All' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1).replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Services List */}
      <div className="px-6 pb-6 space-y-4">
        {filtered?.length === 0 && (
          <p className="text-sm text-muted-foreground py-8 text-center">No service requests match your search.</p>
        )}
        {filtered?.map((service) => (
          <Link key={service.id} href={`/dashboard/services/${service.id}`}>
            <div className="rounded-lg border border-border bg-card p-6 transition-all hover:shadow-lg hover:border-primary/50 cursor-pointer">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
                {/* Customer Name & Type */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Customer</p>
                  <p className="mt-1 text-lg font-bold text-foreground">{service.customerName}</p>
                  <p className="mt-2 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    {service.type}
                  </p>
                </div>

                {/* Date */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Date</p>
                  <div className="mt-1 flex items-center gap-2 text-foreground">
                    <Calendar size={16} />
                    {service.date}
                  </div>
                </div>

                {/* Assigned Engineer */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Engineer</p>
                  <div className="mt-1 flex items-center gap-2 text-foreground">
                    <User size={16} />
                    {service.assignedEngineer}
                  </div>
                </div>

                {/* Status */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Status</p>
                  <div className="mt-1">
                    <StatusBadge status={service.status as any} />
                  </div>
                </div>

                {/* Action */}
                <div className="flex items-center justify-end">
                  <button className="rounded-lg p-2 hover:bg-muted">
                    <ChevronRight size={20} className="text-muted-foreground" />
                  </button>
                </div>
              </div>

              {/* Description */}
              <div className="mt-4 border-t border-border pt-4">
                <p className="text-sm text-muted-foreground">{service.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
