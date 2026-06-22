'use client';

import { useEffect, useState, use } from 'react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { Mail, Phone, MapPin, Calendar, Zap, DollarSign, FileText } from 'lucide-react';
import { Customer } from '@/lib/services/customers';
import { useFirestoreDoc } from '@/lib/hooks/useFirestore';
import { db } from '@/lib/firebase';

export default function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: customerData, loading, error } = useFirestoreDoc<Customer>('customers', id);

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
            <Button variant="outline">Edit</Button>
            <Button variant="outline" className="text-red-600 hover:bg-red-50">
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
                    {customer.installationDate}
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
                  <p className="mt-1 font-medium text-foreground">{customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'N/A'}</p>
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
                  <DollarSign size={24} className="text-green-600" />
                  {customer.totalSpent || 0}
                </p>
              </div>

              <div className="border-t border-border pt-3">
                <p className="text-sm text-muted-foreground">
                  Average Monthly Cost
                </p>
                <p className="mt-1 text-lg font-semibold text-foreground">
                  $185.50
                </p>
              </div>

              <div className="border-t border-border pt-3">
                <p className="text-sm text-muted-foreground">
                  Energy Savings (Annual)
                </p>
                <p className="mt-1 text-lg font-semibold text-green-600">
                  $2,450
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
    </div>
  );
}