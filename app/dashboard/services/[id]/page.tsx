'use client';

import { use, useState } from 'react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { Calendar, User, Wrench, ArrowLeft } from 'lucide-react';
import { ServiceRequest } from '@/lib/services/serviceRequests';
import { useFirestoreDoc } from '@/lib/hooks/useFirestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: service, loading, error } = useFirestoreDoc<ServiceRequest>('serviceRequests', id);

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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={service.customerName}
        description={`${service.type} Service Request`}
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

      {/* Main Content */}
      <div className="px-6 py-6 grid gap-6 lg:grid-cols-3">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Service Information */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-6 text-lg font-semibold text-foreground">
              Service Information
            </h2>

            <div className="space-y-4">
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
                  <p className="font-medium text-foreground">{service.assignedEngineer}</p>
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
            </div>
          </div>

          {/* Description */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-6 text-lg font-semibold text-foreground">
              Description
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {service.description}
            </p>
          </div>
        </div>

        {/* Right Column - Summary */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">Status</p>
            <div className="mt-3">
              <StatusBadge status={service.status as any} />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-4 font-semibold text-foreground">
              Quick Actions
            </h3>

            <div className="space-y-2">
              <Button variant="outline" className="w-full">
                Update Status
              </Button>
              <Button variant="outline" className="w-full">
                Reassign Engineer
              </Button>
              <Button variant="outline" className="w-full">
                Cancel Service
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}