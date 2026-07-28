'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { findCustomerByPhone, saveInstallation } from '@/lib/services/engineers';
import { Plus, Trash2, Search, AlertCircle, CheckCircle, User } from 'lucide-react';

export default function NewInstallationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Customer search
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerSearching, setCustomerSearching] = useState(false);
  const [customerFound, setCustomerFound] = useState<{ id: string; name: string; phone: string } | null>(null);
  const [customerSearchError, setCustomerSearchError] = useState<string | null>(null);

  // Installation form
  const [inverterSerial, setInverterSerial] = useState('');
  const [solarPanelSerials, setSolarPanelSerials] = useState<string[]>(['']);
  const [acWireUsed, setAcWireUsed] = useState('');
  const [dcWireUsed, setDcWireUsed] = useState('');
  const [earthingWireUsed, setEarthingWireUsed] = useState('');
  const [notes, setNotes] = useState('');

  const handleCustomerSearch = async () => {
    if (!customerPhone.trim()) {
      setCustomerSearchError('Please enter a mobile number');
      return;
    }

    setCustomerSearching(true);
    setCustomerSearchError(null);
    setCustomerFound(null);

    try {
      const result = await findCustomerByPhone(customerPhone.trim());
      if (!result) {
        setCustomerSearchError('No customer found with this mobile number');
      } else {
        setCustomerFound({
          id: result.id,
          name: result.name,
          phone: result.phone,
        });
      }
    } catch (err) {
      setCustomerSearchError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setCustomerSearching(false);
    }
  };

  const addSolarPanelSerial = () => {
    setSolarPanelSerials([...solarPanelSerials, '']);
  };

  const removeSolarPanelSerial = (index: number) => {
    if (solarPanelSerials.length > 1) {
      setSolarPanelSerials(solarPanelSerials.filter((_, i) => i !== index));
    }
  };

  const updateSolarPanelSerial = (index: number, value: string) => {
    const updated = [...solarPanelSerials];
    updated[index] = value;
    setSolarPanelSerials(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (!customerFound) {
      setError('Please search and select a customer first');
      return;
    }

    if (!inverterSerial.trim()) {
      setError('Inverter serial number is required');
      return;
    }

    const validPanelSerials = solarPanelSerials.filter((s) => s.trim());
    if (validPanelSerials.length === 0) {
      setError('At least one solar panel serial number is required');
      return;
    }

    setLoading(true);

    try {
      const engineerId = sessionStorage.getItem('engineerUid') || '';
      const engineerName = sessionStorage.getItem('engineerName') || '';

      await saveInstallation({
        customerPhone: customerFound.phone,
        customerName: customerFound.name,
        customerId: customerFound.id,
        engineerId,
        engineerName,
        inverterSerialNumber: inverterSerial.trim(),
        solarPanelSerialNumbers: validPanelSerials,
        acWireUsed: acWireUsed.trim(),
        dcWireUsed: dcWireUsed.trim(),
        earthingWireUsed: earthingWireUsed.trim(),
        notes: notes.trim(),
        installationDate: new Date().toISOString().split('T')[0],
      });

      setSuccess('Installation recorded successfully!');

      // Reset form
      setCustomerFound(null);
      setCustomerPhone('');
      setInverterSerial('');
      setSolarPanelSerials(['']);
      setAcWireUsed('');
      setDcWireUsed('');
      setEarthingWireUsed('');
      setNotes('');

      // Redirect after short delay
      setTimeout(() => {
        router.push('/engineer/installations');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save installation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-3xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">New Installation</h1>
        <p className="text-muted-foreground mt-1">
          Record installation details for a customer
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 p-4 text-sm text-green-800 border border-green-200">
          <CheckCircle size={16} />
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* Step 1: Customer Selection */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              1
            </span>
            Select Customer
          </h2>

          {/* Customer Search */}
          <div className="flex gap-3 mb-4">
            <div className="flex-1">
              <Input
                type="tel"
                placeholder="Enter customer mobile number"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                disabled={customerSearching || !!customerFound}
              />
            </div>
            {!customerFound ? (
              <Button
                type="button"
                variant="outline"
                onClick={handleCustomerSearch}
                disabled={customerSearching}
              >
                {customerSearching ? 'Searching...' : 'Search'}
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCustomerFound(null);
                  setCustomerPhone('');
                }}
              >
                Change
              </Button>
            )}
          </div>

          {/* Customer Search Error */}
          {customerSearchError && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive mb-4">
              <AlertCircle size={14} />
              {customerSearchError}
            </div>
          )}

          {/* Selected Customer */}
          {customerFound && (
            <div className="flex items-center gap-3 rounded-lg bg-primary/5 p-4 border border-primary/20">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                <User size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{customerFound.name}</p>
                <p className="text-xs text-muted-foreground">{customerFound.phone}</p>
              </div>
              <CheckCircle size={20} className="ml-auto text-green-500" />
            </div>
          )}
        </div>

        {/* Step 2: Equipment Details */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              2
            </span>
            Equipment Details
          </h2>

          {/* Inverter Serial Number */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              Inverter Serial Number <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="INV-2024-XXXXX"
              value={inverterSerial}
              onChange={(e) => setInverterSerial(e.target.value)}
              required
            />
          </div>

          {/* Solar Panel Serial Numbers */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-foreground">
                Solar Panel Serial Numbers <span className="text-destructive">*</span>
              </label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addSolarPanelSerial}
                className="text-primary"
              >
                <Plus size={16} className="mr-1" />
                Add More
              </Button>
            </div>
            <div className="space-y-2">
              {solarPanelSerials.map((serial, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`Panel Serial #${index + 1}`}
                    value={serial}
                    onChange={(e) => updateSolarPanelSerial(index, e.target.value)}
                    className="flex-1"
                  />
                  {solarPanelSerials.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSolarPanelSerial(index)}
                      className="text-destructive hover:text-destructive/80"
                    >
                      <Trash2 size={18} />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Step 3: Wiring Details */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              3
            </span>
            Wiring Details
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                AC Wire Used (meters)
              </label>
              <Input
                type="text"
                placeholder="e.g. 50 meters, 2.5 sqmm"
                value={acWireUsed}
                onChange={(e) => setAcWireUsed(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                DC Wire Used (meters)
              </label>
              <Input
                type="text"
                placeholder="e.g. 30 meters, 4 sqmm"
                value={dcWireUsed}
                onChange={(e) => setDcWireUsed(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Earthing Wire Used (meters)
              </label>
              <Input
                type="text"
                placeholder="e.g. 20 meters"
                value={earthingWireUsed}
                onChange={(e) => setEarthingWireUsed(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Step 4: Additional Notes */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              4
            </span>
            Additional Notes (Optional)
          </h2>
          <textarea
            placeholder="Any additional notes about the installation..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-border bg-card px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/engineer/dashboard')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[160px]"
          >
            {loading ? 'Saving...' : 'Save Installation'}
          </Button>
        </div>
      </form>
    </div>
  );
}