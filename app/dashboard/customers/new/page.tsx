'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/layout/page-header';
import { useFirebaseStorage } from '@/lib/hooks/useFirebaseStorage';
import { addCustomer } from '@/lib/services/customers';
import { useRouter } from 'next/navigation';

export default function AddCustomerPage() {
  const router = useRouter();
  const { uploadFile, uploading } = useFirebaseStorage();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    systemSize: string;
    installationDate: string;
    status: 'pending' | 'active' | 'inactive';
    alternatePhone: string;
    connectionNumber: string;
  }>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    systemSize: '',
    installationDate: '',
    status: 'pending',
    alternatePhone: '',
    connectionNumber: '',
  });

  const [documents, setDocuments] = useState({
    aadhaarFront: null as File | null,
    aadhaarBack: null as File | null,
    panCard: null as File | null,
    bankPassbook: null as File | null,
    electricityBill: null as File | null,
    gpsPhoto: null as File | null,
    ownershipDocument: null as File | null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    if (e.target.files && e.target.files[0]) {
      setDocuments({
        ...documents,
        [field]: e.target.files[0],
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const documentUrls: Record<string, string> = {};
      
      if (documents.aadhaarFront) {
        documentUrls.aadhaarFront = await uploadFile(`customers/documents/${Date.now()}_aadhaar_front`, documents.aadhaarFront);
      }
      if (documents.aadhaarBack) {
        documentUrls.aadhaarBack = await uploadFile(`customers/documents/${Date.now()}_aadhaar_back`, documents.aadhaarBack);
      }
      if (documents.panCard) {
        documentUrls.panCard = await uploadFile(`customers/documents/${Date.now()}_pan_card`, documents.panCard);
      }
      if (documents.bankPassbook) {
        documentUrls.bankPassbook = await uploadFile(`customers/documents/${Date.now()}_bank_passbook`, documents.bankPassbook);
      }
      if (documents.electricityBill) {
        documentUrls.electricityBill = await uploadFile(`customers/documents/${Date.now()}_electricity_bill`, documents.electricityBill);
      }
      if (documents.gpsPhoto) {
        documentUrls.gpsPhoto = await uploadFile(`customers/documents/${Date.now()}_gps_photo`, documents.gpsPhoto);
      }
      if (documents.ownershipDocument) {
        documentUrls.ownershipDocument = await uploadFile(`customers/documents/${Date.now()}_ownership_document`, documents.ownershipDocument);
      }

      const customerData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        systemSize: parseFloat(formData.systemSize) || 0,
        installationDate: formData.installationDate,
        status: formData.status as 'pending' | 'active' | 'inactive',
        monthlyUsage: 0,
        alternatePhone: formData.alternatePhone || undefined,
        connectionNumber: formData.connectionNumber || undefined,
        documents: Object.keys(documentUrls).length > 0 ? documentUrls : undefined,
      };

      await addCustomer(customerData);
      router.push('/dashboard/customers');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add customer');
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add New Customer"
        description="Create a new customer account"
        breadcrumbs={[
          { label: 'Customers', href: '/dashboard/customers' },
          { label: 'New Customer' },
        ]}
      />

      <form onSubmit={handleSubmit} className="px-6 py-6 max-w-2xl">
        <div className="rounded-lg border border-border bg-card p-8 space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">
              {error}
            </div>
          )}

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
                  placeholder="Aviral Shukla"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Mobile Number
                  </label>
                  <Input
                    name="phone"
                    type="tel"
                    placeholder="+91 9876543210"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Alternate Mobile Number
                  </label>
                  <Input
                    name="alternatePhone"
                    type="tel"
                    placeholder="+91 9876543210"
                    value={formData.alternatePhone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email
                </label>
                <Input
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Address
                </label>
                <Input
                  name="address"
                  placeholder="123 Main Street, City"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
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
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    ZIP Code
                  </label>
                  <Input
                    name="zipCode"
                    placeholder="400001"
                    value={formData.zipCode}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* System Information */}
          <div className="border-t border-border pt-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Solar System Information
            </h2>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Connection Number
                  </label>
                  <Input
                    name="connectionNumber"
                    placeholder="e.g., CONN-001234"
                    value={formData.connectionNumber}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Plant Size (KW)
                  </label>
                  <Input
                    name="systemSize"
                    type="number"
                    step="0.1"
                    placeholder="6.5"
                    value={formData.systemSize}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Installation Date
                  </label>
                  <Input
                    name="installationDate"
                    type="date"
                    value={formData.installationDate}
                    onChange={handleChange}
                    required
                  />
                </div>
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
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="border-t border-border pt-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Documents (Optional)
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Upload customer documents. Supported formats: JPG, PNG, PDF
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Aadhaar Card (Front) <span className="text-muted-foreground">(Optional)</span>
                </label>
                <Input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileChange(e, 'aadhaarFront')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Aadhaar Card (Back) <span className="text-muted-foreground">(Optional)</span>
                </label>
                <Input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileChange(e, 'aadhaarBack')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  PAN Card <span className="text-muted-foreground">(Optional)</span>
                </label>
                <Input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileChange(e, 'panCard')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Bank Passbook <span className="text-muted-foreground">(Optional)</span>
                </label>
                <Input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileChange(e, 'bankPassbook')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Electricity Bill <span className="text-muted-foreground">(Optional)</span>
                </label>
                <Input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileChange(e, 'electricityBill')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  GPS Photo <span className="text-muted-foreground">(Optional)</span>
                </label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'gpsPhoto')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Ownership Document <span className="text-muted-foreground">(Optional)</span>
                </label>
                <Input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileChange(e, 'ownershipDocument')}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-border pt-6 flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={saving || uploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={saving || uploading}
            >
              {saving || uploading ? 'Saving...' : 'Create Customer'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}