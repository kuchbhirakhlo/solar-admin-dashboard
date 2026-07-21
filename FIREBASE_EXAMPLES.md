# Firebase Integration Examples

This guide shows practical examples of using Firebase with the Solar Energy Admin Dashboard.

## Table of Contents
1. [Authentication Examples](#authentication-examples)
2. [Firestore Data Operations](#firestore-data-operations)
3. [Storage Examples](#storage-examples)
4. [Real-time Data](#real-time-data)

---

## Authentication Examples

### Example 1: Protected Dashboard Route

Create a component that redirects unauthenticated users to login:

```typescript
'use client';

import { useFirebaseAuth } from '@/lib/firebase-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function ProtectedDashboard() {
  const { user, loading } = useFirebaseAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  return (
    <div>
      <h1>Welcome, {user.email}</h1>
      {/* Dashboard content */}
    </div>
  );
}
```

### Example 2: Logout Button

```typescript
'use client';

import { Button } from '@/components/ui/button';
import { logout } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return <Button onClick={handleLogout}>Logout</Button>;
}
```

### Example 3: User Profile Display

```typescript
'use client';

import { useFirebaseAuth } from '@/lib/firebase-context';

export function UserProfile() {
  const { user } = useFirebaseAuth();

  if (!user) return null;

  return (
    <div>
      <img src={user.photoURL || '/default-avatar.png'} alt="Avatar" />
      <p>{user.displayName || 'User'}</p>
      <p>{user.email}</p>
    </div>
  );
}
```

---

## Firestore Data Operations

### Example 1: Display Customers List

```typescript
'use client';

import { useFirestoreCollection } from '@/lib/hooks/useFirestore';
import { Customer } from '@/lib/services/customers';

export function CustomersList() {
  const { data: customers, loading, error } = useFirestoreCollection<Customer>('customers');

  if (loading) return <div>Loading customers...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Customers ({customers?.length || 0})</h2>
      <ul>
        {customers?.map((customer) => (
          <li key={customer.id}>
            <strong>{customer.name}</strong>
            <p>{customer.email} | {customer.phone}</p>
            <p>System Size: {customer.systemSize} kW</p>
            <p>Status: <span className={`status-${customer.status}`}>{customer.status}</span></p>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Example 2: Create Customer Form

```typescript
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { addCustomer } from '@/lib/services/customers';
import { useState } from 'react';

export function AddCustomerForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    systemSize: 5,
    installationDate: '',
    status: 'pending' as const,
    monthlyUsage: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const docId = await addCustomer(formData);
      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        systemSize: 5,
        installationDate: '',
        status: 'pending',
        monthlyUsage: 0,
      });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add customer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      {error && <div className="text-red-500">{error}</div>}
      {success && <div className="text-green-500">Customer added successfully!</div>}

      <div>
        <label>Name</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div>
        <label>Email</label>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>

      <div>
        <label>Phone</label>
        <Input
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
      </div>

      <div>
        <label>Address</label>
        <Input
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        />
      </div>

      <div>
        <label>City</label>
        <Input
          value={formData.city}
          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
        />
      </div>

      <div>
        <label>State</label>
        <Input
          value={formData.state}
          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
        />
      </div>

      <div>
        <label>ZIP Code</label>
        <Input
          value={formData.zipCode}
          onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
        />
      </div>

      <div>
        <label>System Size (kW)</label>
        <Input
          type="number"
          value={formData.systemSize}
          onChange={(e) => setFormData({ ...formData, systemSize: parseFloat(e.target.value) })}
        />
      </div>

      <div>
        <label>Installation Date</label>
        <Input
          type="date"
          value={formData.installationDate}
          onChange={(e) => setFormData({ ...formData, installationDate: e.target.value })}
        />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? 'Adding...' : 'Add Customer'}
      </Button>
    </form>
  );
}
```

### Example 3: Update Customer Data

```typescript
'use client';

import { Button } from '@/components/ui/button';
import { updateCustomer } from '@/lib/services/customers';
import { useState } from 'react';

interface EditCustomerProps {
  customerId: string;
  onUpdate?: () => void;
}

export function EditCustomer({ customerId, onUpdate }: EditCustomerProps) {
  const [status, setStatus] = useState<'active' | 'pending' | 'inactive'>('active');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStatusUpdate = async () => {
    setLoading(true);
    setError(null);

    try {
      await updateCustomer(customerId, { status });
      onUpdate?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && <div className="text-red-500">{error}</div>}

      <div>
        <label>Customer Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
          className="border rounded px-3 py-2"
        >
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <Button onClick={handleStatusUpdate} disabled={loading}>
        {loading ? 'Updating...' : 'Update Status'}
      </Button>
    </div>
  );
}
```

### Example 4: Delete Customer

```typescript
'use client';

import { Button } from '@/components/ui/button';
import { deleteCustomer } from '@/lib/services/customers';
import { useState } from 'react';

interface DeleteCustomerProps {
  customerId: string;
  customerName: string;
  onDelete?: () => void;
}

export function DeleteCustomer({
  customerId,
  customerName,
  onDelete,
}: DeleteCustomerProps) {
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleDelete = async () => {
    setLoading(true);

    try {
      await deleteCustomer(customerId);
      onDelete?.();
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {!confirmed ? (
        <Button
          onClick={() => setConfirmed(true)}
          variant="destructive"
        >
          Delete Customer
        </Button>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-red-600">
            Are you sure you want to delete {customerName}? This cannot be undone.
          </p>
          <div className="flex gap-2">
            <Button
              onClick={handleDelete}
              disabled={loading}
              variant="destructive"
            >
              {loading ? 'Deleting...' : 'Confirm Delete'}
            </Button>
            <Button onClick={() => setConfirmed(false)} variant="outline">
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## Storage Examples

### Example 1: Upload Customer Avatar

```typescript
'use client';

import { Button } from '@/components/ui/button';
import { useFirebaseStorage } from '@/lib/hooks/useFirebaseStorage';
import { useState } from 'react';

interface AvatarUploadProps {
  customerId: string;
  onUploadComplete?: (url: string) => void;
}

export function AvatarUpload({ customerId, onUploadComplete }: AvatarUploadProps) {
  const { uploadFile, uploading, error } = useFirebaseStorage();
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    try {
      const url = await uploadFile(
        `customers/${customerId}/avatar_${Date.now()}.jpg`,
        file
      );
      onUploadComplete?.(url);
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  return (
    <div className="space-y-4">
      {error && <div className="text-red-500">{error}</div>}

      {preview && (
        <img src={preview} alt="Preview" className="w-32 h-32 rounded-lg" />
      )}

      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={uploading}
        className="block"
      />

      {uploading && <p>Uploading...</p>}
    </div>
  );
}
```

### Example 2: Upload Installation Photos

```typescript
'use client';

import { Button } from '@/components/ui/button';
import { useFirebaseStorage } from '@/lib/hooks/useFirebaseStorage';
import { useState } from 'react';

interface InstallationPhotoProps {
  installationId: string;
}

export function UploadInstallationPhotos({ installationId }: InstallationPhotoProps) {
  const { uploadFile, uploading, error } = useFirebaseStorage();
  const [photos, setPhotos] = useState<string[]>([]);

  const handleMultipleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const uploadPromises = Array.from(files).map((file) =>
      uploadFile(
        `installations/${installationId}/${Date.now()}_${file.name}`,
        file
      )
    );

    try {
      const urls = await Promise.all(uploadPromises);
      setPhotos([...photos, ...urls]);
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  return (
    <div className="space-y-4">
      {error && <div className="text-red-500">{error}</div>}

      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleMultipleFiles}
        disabled={uploading}
      />

      {uploading && <p>Uploading photos...</p>}

      <div className="grid grid-cols-2 gap-4">
        {photos.map((url) => (
          <img key={url} src={url} alt="Installation photo" className="rounded" />
        ))}
      </div>
    </div>
  );
}
```

---

## Real-time Data

### Example: Real-time Customer Status Updates

To enable real-time updates, modify the `useFirestoreCollection` hook to use `onSnapshot`:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, QueryConstraint } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function useFirestoreCollectionRealtime<T extends { id?: string }>(
  collectionName: string,
  constraints?: QueryConstraint[]
) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const q = query(collection(db, collectionName), ...(constraints || []));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const items = snapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          })) as T[];
          setData(items);
          setError(null);
          setLoading(false);
        },
        (error) => {
          setError(error.message);
          setLoading(false);
        }
      );

      return unsubscribe;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error setting up listener');
      setLoading(false);
    }
  }, [collectionName, constraints]);

  return { data, loading, error };
}
```

Usage:

```typescript
const { data: customers } = useFirestoreCollectionRealtime<Customer>('customers');
// Automatically updates whenever customers change in Firestore
```

---

## Firebase Security Rules

### Firestore Security Rules Example

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read and write their own data
    match /customers/{customerId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }

    // Allow authenticated users to read Partner
    match /Partner/{agentId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && hasRole('admin');
    }

    // Admin-only access to payments
    match /payments/{paymentId} {
      allow read, write: if request.auth != null && hasRole('admin');
    }

    // Helper function to check user role
    function hasRole(role) {
      return request.auth != null && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == role;
    }
  }
}
```

---

## Next Steps

1. Set up Firestore Security Rules in Firebase Console
2. Create indexes for commonly queried fields
3. Implement error handling in your components
4. Add form validation before submitting to Firestore
5. Consider pagination for large collections
