'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/layout/page-header';
import { addFirestoreDocWithAutoId } from '@/lib/hooks/useFirestore';

export default function AddAgentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    address: '',
    zipCode: '',
    status: 'active',
    role: 'agent',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const docData: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: 'agent',
        status: formData.status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Add optional fields only if provided
      if (formData.address) docData.address = formData.address;
      if (formData.city) docData.city = formData.city;
      if (formData.state) docData.state = formData.state;
      if (formData.zipCode) docData.zipCode = formData.zipCode;

      await addFirestoreDocWithAutoId('users', docData);
      router.push('/dashboard/agents');
    } catch (error) {
      console.error('Failed to create agent:', error);
      alert('Failed to create agent. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Add New Agent"
        description="Create a new sales agent account"
        breadcrumbs={[
          { label: 'Agents', href: '/dashboard/agents' },
          { label: 'New Agent' },
        ]}
      />

      {/* Form */}
      <div className="px-6 py-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-card p-8 space-y-6">
          {/* Personal Information */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Personal Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Full Name
                </label>
                <Input
                  name="name"
                  placeholder="Enter name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email
                  </label>
                  <Input
                    name="email"
                    type="email"
                    placeholder="agent@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Phone
                  </label>
                  <Input
                    name="phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="border-t border-border pt-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Location Information
            </h2>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    City
                  </label>
                  <Input
                    name="city"
                    placeholder="Mumbai"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    State
                  </label>
                  <Input
                    name="state"
                    placeholder="Maharashtra"
                    value={formData.state}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Address
                </label>
                <Input
                  name="address"
                  placeholder="Street address (optional)"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  ZIP Code
                </label>
                <Input
                  name="zipCode"
                  placeholder="400001 (optional)"
                  value={formData.zipCode}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="border-t border-border pt-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Account Status
            </h2>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-lg border border-border bg-card px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-border pt-6 flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard/agents')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Agent'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
