'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { findCustomerByPhone } from '@/lib/services/engineers';
import { Search, User, Phone, Mail, MapPin, Calendar, Zap, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface CustomerResult {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  systemSize?: number;
  installationDate?: string;
  status?: string;
  [key: string]: any;
}

export default function CustomerLookupPage() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customer, setCustomer] = useState<CustomerResult | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setCustomer(null);
    setSearched(true);

    if (!phone.trim()) {
      setError('Please enter a mobile number');
      setLoading(false);
      return;
    }

    try {
      const result = await findCustomerByPhone(phone.trim());
      if (!result) {
        setError('No customer found with this mobile number');
      } else {
        setCustomer(result as CustomerResult);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
            <CheckCircle size={12} />
            Active
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
            <AlertCircle size={12} />
            Pending
          </span>
        );
      case 'inactive':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
            Inactive
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
            {status || 'N/A'}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Find Customer</h1>
        <p className="text-muted-foreground mt-1">
          Search for a customer by their mobile number
        </p>
      </div>

      {/* Search Form */}
      <div className="max-w-md">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="flex-1">
            <Input
              type="tel"
              placeholder="Enter mobile number (e.g. +91 98765 43210)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={loading}
              className="w-full"
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-4 text-sm text-destructive max-w-lg">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Customer Details */}
      {customer && (
        <div className="max-w-2xl">
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            {/* Customer Header */}
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-6 border-b border-border">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
                  <User size={32} className="text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    {customer.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusBadge(customer.status)}
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="p-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3">
                  <Phone size={18} className="text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="text-sm font-medium text-foreground">
                      {customer.phone || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium text-foreground">
                      {customer.email || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin size={18} className="text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="text-sm font-medium text-foreground">
                      {[customer.address, customer.city, customer.state]
                        .filter(Boolean)
                        .join(', ') || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Zap size={18} className="text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">System Size</p>
                    <p className="text-sm font-medium text-foreground">
                      {customer.systemSize ? `${customer.systemSize} kW` : 'N/A'}
                    </p>
                  </div>
                </div>
                {customer.installationDate && (
                  <div className="flex items-center gap-3">
                    <Calendar size={18} className="text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Installation Date</p>
                      <p className="text-sm font-medium text-foreground">
                        {customer.installationDate}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-border p-4 bg-muted/30 flex justify-end">
              <Link href="/engineer/installations/new">
                <Button>
                  <Zap size={16} className="mr-2" />
                  Record Installation for This Customer
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Empty State (when no search performed yet) */}
      {!searched && !customer && !error && (
        <div className="flex flex-col items-center justify-center py-16 text-center max-w-lg mx-auto">
          <Search size={48} className="text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Search Customer
          </h3>
          <p className="text-sm text-muted-foreground">
            Enter a customer's mobile number above to look up their details
          </p>
        </div>
      )}
    </div>
  );
}