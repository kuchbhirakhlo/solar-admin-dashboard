'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/layout/page-header';
import { addEmployee } from '@/lib/services/users';
import { Copy, Check } from 'lucide-react';

export default function AddEmployeePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [copied, setCopied] = useState(false);
  const [createdPassword, setCreatedPassword] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'active',
    role: 'engineer',
    password: '',
  });

  const generateStrongPassword = (): string => {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const digits = '0123456789';
    const special = '!@#$%^&*';
    const all = upper + lower + digits + special;
    const required = [
      upper[Math.floor(Math.random() * upper.length)],
      lower[Math.floor(Math.random() * lower.length)],
      digits[Math.floor(Math.random() * digits.length)],
      special[Math.floor(Math.random() * special.length)],
    ];
    const remaining = Array.from({ length: 8 }, () => all[Math.floor(Math.random() * all.length)]);
    return [...required, ...remaining].sort(() => Math.random() - 0.5).join('');
  };

  const copyPassword = async () => {
    if (createdPassword) {
      await navigator.clipboard.writeText(createdPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const generateEmail = (name: string) => {
    const sanitizedName = name.toLowerCase().replace(/[^a-z0-9]/g, '.');
    return `${sanitizedName}@solarexpert.com`;
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData((prev) => ({ ...prev, name }));
    const email = generateEmail(name);
    setGeneratedEmail(email);
    if (!formData.email) {
      setFormData((prev) => ({ ...prev, email }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || createdPassword) return;
    if (formData.role === 'registrar' && formData.password.length < 6) {
      setError('Enter a registrar password with at least 6 characters.');
      return;
    }
    setLoading(true);
    setError(null);
    setCreatedPassword(null);

    const password = formData.role === 'registrar' ? formData.password : generateStrongPassword();

    try {
      await addEmployee({
        name: formData.name,
        email: formData.email,
        phone: formData.role === 'agent' ? formData.phone : formData.phone.replace(/^\s*\+?91[\s-]*/, '').replace(/[\s-]/g, ''),
        password,
        role: formData.role as 'engineer' | 'registrar' | 'agent',
        status: formData.status as 'active' | 'inactive' | 'suspended',
      });

      // Confirm the password the admin set for registrar login.
      if (formData.role === 'registrar') {
        setCreatedPassword(password);
        setFormData((prev) => ({ ...prev, password: '' }));
      } else {
        router.push('/dashboard/agents');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create employee';
      setError(message);
      console.error('Failed to create employee:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value, ...(name === 'role' ? { password: '' } : {}) }));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Add New Employee"
        description="Create a new employee account (Engineer, Registrar, or Partner)"
        breadcrumbs={[
          { label: 'Employees', href: '/dashboard/agents' },
          { label: 'New Employee' },
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
                  onChange={handleNameChange}
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
                    placeholder="auto-generated"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  {generatedEmail && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Suggested: {generatedEmail}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Phone
                  </label>
                  <Input
                    name="phone"
                    type="tel"
                    placeholder="98765 43210"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Role Selection */}
          <div className="border-t border-border pt-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Employee Role
            </h2>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full rounded-lg border border-border bg-card px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="engineer">Engineer</option>
                <option value="registrar">Registrar</option>
                <option value="agent">Partner</option>
              </select>
              <p className="mt-1 text-xs text-muted-foreground">
                Engineers and Registrars can login from the browser. Partners login from the mobile app.
                Partners use an OTP sent to their registered mobile number. Engineers and Registrars use email and password.
              </p>
            </div>
          </div>

          {/* Registrar login password */}
          {formData.role === 'registrar' && !createdPassword && (
            <div className="border-t border-border pt-6">
              <label htmlFor="registrar-password" className="block text-sm font-medium text-foreground mb-2">
                Registrar Password
              </label>
              <Input
                id="registrar-password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                minLength={6}
                required
                disabled={loading}
                aria-describedby="registrar-password-help"
              />
              <p id="registrar-password-help" className="mt-1 text-xs text-muted-foreground">
                Use at least 6 characters. The registrar can log in with their email and this password.
              </p>
            </div>
          )}

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

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* One-time password banner for registrar */}
          {createdPassword ? (
            <div className="border-t border-border pt-6">
              <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
                <p className="text-sm font-semibold text-green-600 mb-1">Registrar created successfully!</p>
                <p className="text-xs text-muted-foreground mb-3">Share the account email and this password with the registrar to log in through the Registrar Portal. This password will not be shown again after leaving this page.</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded bg-muted px-3 py-2 font-mono text-sm break-all">{createdPassword}</code>
                  <button
                    type="button"
                    onClick={copyPassword}
                    className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                    title="Copy password"
                  >
                    {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                  </button>
                </div>
                <Button
                  type="button"
                  onClick={() => router.push('/dashboard/agents')}
                  className="mt-3 w-full"
                >
                  Go to Employees
                </Button>
              </div>
            </div>
          ) : (
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
                {loading ? 'Creating...' : 'Create Employee'}
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
