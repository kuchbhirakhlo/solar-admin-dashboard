'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/layout/page-header';
import { addEmployee } from '@/lib/services/users';
import { Eye, EyeOff, RefreshCw, Copy, Check } from 'lucide-react';

export default function AddEmployeePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('medium');
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    status: 'active',
    role: 'engineer',
  });

  /**
   * Generate a secure random password
   */
  const generatePassword = () => {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const digits = '0123456789';
    const special = '!@#$%^&*';
    
    // Ensure at least one of each type
    const required = [
      upper[Math.floor(Math.random() * upper.length)],
      lower[Math.floor(Math.random() * lower.length)],
      digits[Math.floor(Math.random() * digits.length)],
      special[Math.floor(Math.random() * special.length)],
    ];
    
    // Fill the rest to make 12 characters total
    const all = upper + lower + digits + special;
    const remaining = Array.from({ length: 8 }, () =>
      all[Math.floor(Math.random() * all.length)]
    );
    
    // Shuffle all characters together
    const password = [...required, ...remaining]
      .sort(() => Math.random() - 0.5)
      .join('');
    
    setFormData((prev) => ({ ...prev, password }));
    evaluatePasswordStrength(password);
    setCopied(false);
  };

  /**
   * Evaluate password strength
   */
  const evaluatePasswordStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    if (score <= 2) setPasswordStrength('weak');
    else if (score <= 4) setPasswordStrength('medium');
    else setPasswordStrength('strong');
  };

  /**
   * Copy password to clipboard
   */
  const copyPassword = async () => {
    if (formData.password) {
      await navigator.clipboard.writeText(formData.password);
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

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    setFormData((prev) => ({ ...prev, password }));
    evaluatePasswordStrength(password);
    setCopied(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate password
    if (!formData.password || formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      await addEmployee({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role as 'engineer' | 'registrar' | 'agent',
        status: formData.status as 'active' | 'inactive' | 'suspended',
      });

      router.push('/dashboard/agents');
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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 'weak': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'strong': return 'bg-green-500';
    }
  };

  const getPasswordStrengthLabel = () => {
    switch (passwordStrength) {
      case 'weak': return 'Weak';
      case 'medium': return 'Medium';
      case 'strong': return 'Strong';
    }
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
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Password Section */}
          <div className="border-t border-border pt-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Login Password
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Set a password for the employee to login. The password will be used to create their Firebase Auth account.
            </p>
            <div className="space-y-3">
              <div className="relative">
                <Input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter or generate a password"
                  value={formData.password}
                  onChange={handlePasswordChange}
                  className="pr-24"
                  required
                  minLength={6}
                />
                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={copyPassword}
                    className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    title="Copy password"
                  >
                    {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    title="Generate strong password"
                  >
                    <RefreshCw size={16} />
                  </button>
                </div>
              </div>

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                      style={{
                        width: passwordStrength === 'weak' ? '33%' : passwordStrength === 'medium' ? '66%' : '100%',
                      }}
                    />
                  </div>
                  <span className={`text-xs font-medium ${
                    passwordStrength === 'weak' ? 'text-red-500' :
                    passwordStrength === 'medium' ? 'text-yellow-500' : 'text-green-500'
                  }`}>
                    {getPasswordStrengthLabel()}
                  </span>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Use the generate button to create a strong password, or enter a custom one (minimum 6 characters).
                Share this password securely with the employee — they will use it along with their email to login.
              </p>
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
                All roles use their email and the password set above to login.
              </p>
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

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

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
              {loading ? 'Creating...' : 'Create Employee'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}