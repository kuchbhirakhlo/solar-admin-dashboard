'use client';

import { useFirestoreCollectionRealtime } from '@/lib/hooks/useFirestore';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { Plus, ChevronRight, Calendar, User, Wrench } from 'lucide-react';
import { ServiceRequest } from '@/lib/services/serviceRequests';
import Link from 'next/link';

export default function ServicesPage() {
  const { data: services, loading, error } = useFirestoreCollectionRealtime<ServiceRequest>('serviceRequests');

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
      {/* Page Header */}
      <PageHeader
        title="Service Requests"
        description="Track and manage all service requests"
        action={
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus size={20} className="mr-2" />
            New Service Request
          </Button>
        }
      />

      {/* Services List */}
      <div className="px-6 py-6 space-y-4">
        {services?.map((service) => (
          <Link key={service.id} href={`/dashboard/services/${service.id}`}>
            <div className="rounded-lg border border-border bg-card p-6 transition-all hover:shadow-lg hover:border-primary/50 cursor-pointer">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-6">
                {/* Service ID & Type */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">
                    Service ID
                  </p>
                  <p className="mt-1 text-lg font-bold text-foreground">
                    {service.id}
                  </p>
                  <p className="mt-2 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    {service.type}
                  </p>
                </div>

                {/* Customer */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">
                    Customer
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-secondary/20" />
                    <p className="font-medium text-foreground">
                      {service.customerName}
                    </p>
                  </div>
                </div>

                {/* Date */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">
                    Date
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-foreground">
                    <Calendar size={16} />
                    {service.date}
                  </div>
                </div>

                {/* Assigned Engineer */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">
                    Engineer
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-foreground">
                    <User size={16} />
                    {service.assignedEngineer}
                  </div>
                </div>

                {/* Status */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">
                    Status
                  </p>
                  <div className="mt-1">
                    <StatusBadge status={service.status as any} />
                  </div>
                </div>

                {/* Action */}
                <div className="flex items-center justify-end">
                  <button className="rounded-lg p-2 hover:bg-muted">
                    <ChevronRight
                      size={20}
                      className="text-muted-foreground"
                    />
                  </button>
                </div>
              </div>

              {/* Description */}
              <div className="mt-4 border-t border-border pt-4">
                <p className="text-sm text-muted-foreground">
                  {service.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
