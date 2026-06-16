# Firebase Integration Guide

This project has been integrated with Firebase for authentication, database, storage, and analytics services.

## Setup Instructions

### 1. Environment Variables

The `.env.local` file contains your Firebase configuration. Make sure these environment variables are set:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 2. Firebase Modules

#### Authentication (`lib/firebase.ts`)
Initialize Firebase app and export authentication, Firestore, and Storage instances.

#### Auth Context (`lib/firebase-context.tsx`)
Provides `FirebaseAuthProvider` to manage authentication state across the app.
- Use `useFirebaseAuth()` hook to access current user and loading state

#### Auth Utilities (`lib/auth.ts`)
Helper functions for authentication:
- `loginWithEmail(email, password)` - Sign in with email/password
- `registerWithEmail(email, password, displayName)` - Create new user
- `logout()` - Sign out current user
- `resetPassword(email)` - Send password reset email
- `updateUserProfile(user, updates)` - Update user profile

### 3. Hooks

#### Firestore Collection Hook (`lib/hooks/useFirestore.ts`)
```typescript
const { data, loading, error } = useFirestoreCollection<UserType>('users');
```

#### Firestore Document Hook
```typescript
const { data, loading, error } = useFirestoreDoc<UserType>('users', userId);
```

#### Firestore Operations
```typescript
// Add document
const docId = await addFirestoreDoc('users', { name: 'John', email: 'john@example.com' });

// Update document
await updateFirestoreDoc('users', docId, { name: 'Jane' });

// Delete document
await deleteFirestoreDoc('users', docId);
```

#### Firebase Storage Hook (`lib/hooks/useFirebaseStorage.ts`)
```typescript
const { uploadFile, deleteFile, getDownloadUrl, uploading, error } = useFirebaseStorage();

// Upload file
const url = await uploadFile('uploads/avatar.jpg', file);

// Get download URL
const downloadUrl = await getDownloadUrl('uploads/avatar.jpg');

// Delete file
await deleteFile('uploads/avatar.jpg');
```

## Features Available

### Authentication
- Email/password authentication
- Password reset
- User profile management
- Session persistence

### Database (Firestore)
- Read/write documents
- Real-time data sync
- Query constraints
- Automatic timestamps (createdAt, updatedAt)

### Storage
- File uploads
- File deletion
- Download URLs
- Progress tracking support

### Analytics
- Automatic page view tracking
- Event tracking (when implemented)

## Usage Examples

### Login Page
The login page (`app/auth/login/page.tsx`) demonstrates Firebase authentication:
```typescript
const handleLogin = async (e: React.FormEvent) => {
  try {
    await loginWithEmail(email, password);
    router.push('/dashboard');
  } catch (err) {
    setError(err.message);
  }
};
```

### Using Auth Context in Components
```typescript
'use client';
import { useFirebaseAuth } from '@/lib/firebase-context';

export function MyComponent() {
  const { user, loading, error } = useFirebaseAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Not logged in</div>;
  
  return <div>Welcome, {user.email}</div>;
}
```

### Fetching Data
```typescript
'use client';
import { useFirestoreCollection } from '@/lib/hooks/useFirestore';

export function CustomersList() {
  const { data: customers, loading, error } = useFirestoreCollection('customers');
  
  if (loading) return <div>Loading...</div>;
  return (
    <ul>
      {customers?.map(customer => (
        <li key={customer.id}>{customer.name}</li>
      ))}
    </ul>
  );
}
```

### Uploading Files
```typescript
'use client';
import { useFirebaseStorage } from '@/lib/hooks/useFirebaseStorage';

export function FileUpload() {
  const { uploadFile, uploading, error } = useFirebaseStorage();
  
  const handleUpload = async (file: File) => {
    try {
      const url = await uploadFile(`uploads/${Date.now()}_${file.name}`, file);
      console.log('File uploaded:', url);
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };
  
  return (
    <input 
      type="file" 
      onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
      disabled={uploading}
    />
  );
}
```

## Production Deployment

Before deploying to production:

1. Set up Firebase Security Rules in the Firebase Console:
   - Configure Firestore rules for authentication and authorization
   - Set up Storage rules for file access control
   - Review and test all rules

2. Update environment variables in your deployment platform (Vercel, etc.)

3. Enable required Firebase services in the console:
   - Authentication (Email/Password)
   - Firestore Database
   - Cloud Storage
   - Google Analytics (optional)

## Troubleshooting

### "Firebase App not initialized"
Make sure `FirebaseAuthProvider` wraps your app in `app/layout.tsx`

### "Permission denied" errors
Check Firebase Firestore/Storage security rules in the Firebase Console

### Authentication not persisting
The auth context automatically handles persistence using Firebase's built-in session management

### CORS errors with storage
Ensure your Firebase Storage rules allow the appropriate access levels for your application
