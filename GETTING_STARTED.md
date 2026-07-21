# Getting Started with Firebase Integration

Welcome to your Solar Energy Admin Dashboard with Firebase! This guide will help you get everything set up and running.

## 📋 Table of Contents

1. [What's Included](#whats-included)
2. [Quick Setup (5 minutes)](#quick-setup-5-minutes)
3. [Project Structure](#project-structure)
4. [Running Locally](#running-locally)
5. [Deployment](#deployment)
6. [Next Steps](#next-steps)

---

## What's Included

### ✅ Complete Dashboard UI
- **21+ Pages** with professional design
- **Dark sidebar** with intuitive navigation
- **Responsive design** that works on all devices
- **Mock data** to demonstrate functionality
- **Modern components** built with Tailwind CSS

### ✅ Firebase Integration
- **Authentication** - Email/password login
- **Firestore Database** - Cloud data storage
- **Cloud Storage** - File uploads and management
- **Analytics** - Track user behavior
- **Hooks & Services** - Ready-to-use utilities

### ✅ Documentation
- `FIREBASE_SETUP.md` - Complete setup guide
- `FIREBASE_EXAMPLES.md` - Code examples
- `FIREBASE_INTEGRATION_SUMMARY.md` - Feature overview
- `GETTING_STARTED.md` - This file

---

## Quick Setup (5 minutes)

### Step 1: Install Dependencies
```bash
cd /path/to/project
pnpm install
# or
npm install
# or
yarn install
```

### Step 2: Set Up Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or use existing one
3. Enable these services:
   - Authentication (Email/Password)
   - Firestore Database
   - Cloud Storage
   - Google Analytics (optional)

### Step 3: Copy Your Firebase Config

From Firebase Console:
1. Click "Project Settings" (gear icon)
2. Copy your configuration
3. Update `.env.local` with your credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123:web:abc123def456
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Step 4: Create Firestore Collections

In Firebase Console > Firestore Database:

Create these collections with sample documents:

**Collection: `customers`**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "555-0100",
  "address": "123 Main St",
  "city": "Springfield",
  "state": "IL",
  "zipCode": "62701",
  "systemSize": 5.5,
  "installationDate": "2023-01-15",
  "status": "active",
  "monthlyUsage": 450
}
```

**Collection: `Partner`**
```json
{
  "name": "Jane Smith",
  "email": "jane@solar.com",
  "phone": "555-0200",
  "region": "North America",
  "licenseNumber": "LIC123456",
  "yearsExperience": 8,
  "status": "active",
  "customersAssigned": 45,
  "totalSales": 1250000,
  "conversionRate": 0.35
}
```

### Step 5: Run Development Server

```bash
pnpm dev
# or
npm run dev
# or
yarn dev
```

Visit http://localhost:3000 in your browser.

---

## Project Structure

```
/app
  /auth
    /login
      page.tsx          ← Login page with Firebase auth
  /dashboard
    page.tsx            ← Dashboard home
    /customers
      page.tsx          ← Customer list
      [id]/page.tsx     ← Customer details
      new/page.tsx      ← Add customer form
    /Partner
      page.tsx          ← Agent list
      new/page.tsx      ← Add agent form
    /engineers/page.tsx
    /services/page.tsx
    /subscriptions/page.tsx
    /installations/page.tsx ← Kanban board
    /payments/page.tsx
    /reports/page.tsx
    /notifications/page.tsx
    /settings/page.tsx
    layout.tsx          ← Dashboard layout wrapper

/lib
  firebase.ts           ← Firebase initialization
  firebase-context.tsx  ← Auth context provider
  auth.ts               ← Auth functions
  constants.ts          ← Mock data
  /hooks
    useFirestore.ts     ← Firestore hooks
    useFirebaseStorage.ts ← Storage hook
  /services
    customers.ts        ← Customer operations
    Partner.ts           ← Agent operations

/components
  /layout
    sidebar.tsx
    top-header.tsx
    page-header.tsx
    dashboard-layout.tsx
  /dashboard
    stat-card.tsx
    status-badge.tsx
  /ui              ← Reusable components
    button.tsx
    input.tsx
    card.tsx
    badge.tsx
```

---

## Running Locally

### Start Development Server
```bash
pnpm dev
```

Then open [http://localhost:3000](http://localhost:3000)

### Key Pages

| Route | Description |
|-------|-------------|
| `/` | Redirects to `/auth/login` |
| `/auth/login` | Login page |
| `/dashboard` | Main dashboard |
| `/dashboard/customers` | Customer management |
| `/dashboard/Partner` | Agent management |
| `/dashboard/engineers` | Engineer management |
| `/dashboard/services` | Service requests |
| `/dashboard/subscriptions` | Subscription plans |
| `/dashboard/installations` | Installation workflow |
| `/dashboard/payments` | Payment tracking |
| `/dashboard/reports` | Business reports |
| `/dashboard/notifications` | Notifications |
| `/dashboard/settings` | Settings |

### Firebase Emulator (Optional)

For local development without using live Firebase:

```bash
firebase emulators:start
```

---

## Deployment

### Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Then set environment variables in Vercel dashboard:
- Go to Project Settings > Environment Variables
- Add all `NEXT_PUBLIC_FIREBASE_*` variables

### Deploy to Other Platforms

The app is built with Next.js and works on:
- Netlify
- AWS Amplify
- Heroku
- Railway
- Firebase Hosting (with Cloud Functions)

Set the same environment variables on your chosen platform.

---

## Using Firebase in Your Code

### Fetch Data
```typescript
'use client';
import { useFirestoreCollection } from '@/lib/hooks/useFirestore';

export function MyComponent() {
  const { data: customers, loading, error } = useFirestoreCollection('customers');
  
  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {customers?.map(c => <div key={c.id}>{c.name}</div>)}
    </div>
  );
}
```

### Add Data
```typescript
import { addCustomer } from '@/lib/services/customers';

await addCustomer({
  name: 'New Customer',
  email: 'new@example.com',
  // ... other fields
});
```

### Update Data
```typescript
import { updateCustomer } from '@/lib/services/customers';

await updateCustomer(customerId, { status: 'active' });
```

### Delete Data
```typescript
import { deleteCustomer } from '@/lib/services/customers';

await deleteCustomer(customerId);
```

### Upload File
```typescript
'use client';
import { useFirebaseStorage } from '@/lib/hooks/useFirebaseStorage';

const { uploadFile } = useFirebaseStorage();
const url = await uploadFile('path/to/file', file);
```

---

## Common Tasks

### Protecting Routes from Unauthorized Access

```typescript
'use client';
import { useFirebaseAuth } from '@/lib/firebase-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function ProtectedComponent() {
  const { user, loading } = useFirebaseAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  return <div>Protected content</div>;
}
```

### Setting Up Security Rules

In Firebase Console > Firestore Database > Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only authenticated users can read/write
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Adding New Collections

1. In Firebase Console, create new collection
2. Create TypeScript interface in your code:
```typescript
interface MyData {
  id?: string;
  field1: string;
  field2: number;
}
```

3. Use the hooks to interact:
```typescript
const { data } = useFirestoreCollection<MyData>('my_collection');
```

---

## Troubleshooting

### "Firebase app not initialized"
Make sure `FirebaseAuthProvider` wraps your app in `app/layout.tsx`

### "Permission denied" errors
Check your Firestore Security Rules in Firebase Console

### Authentication not working
1. Verify credentials in `.env.local`
2. Check that Email/Password auth is enabled in Firebase Console
3. Create a test user in Firebase Console > Authentication

### Files not uploading
1. Check Cloud Storage rules in Firebase Console
2. Verify bucket name in `.env.local`
3. Check browser console for specific errors

---

## Next Steps

1. **Test Authentication**
   - Go to `/auth/login`
   - Create a test user in Firebase Console
   - Test login flow

2. **Add Your Data**
   - Create Firestore collections
   - Update collection structure to match your needs
   - Update TypeScript interfaces

3. **Update Pages**
   - Modify dashboard pages to fetch from Firestore
   - Replace mock data with real data hooks
   - Add create/edit forms

4. **Implement Features**
   - Add real-time data updates
   - Implement search and filtering
   - Add pagination for large datasets
   - Create reports and exports

5. **Security**
   - Configure Firestore Security Rules
   - Set up Cloud Storage rules
   - Implement role-based access control
   - Add audit logging

6. **Deployment**
   - Set up CI/CD pipeline
   - Deploy to production
   - Monitor performance
   - Set up error tracking

---

## Documentation

For more details, see:
- `FIREBASE_SETUP.md` - Detailed setup guide
- `FIREBASE_EXAMPLES.md` - Code examples
- `FIREBASE_INTEGRATION_SUMMARY.md` - Feature overview
- [Firebase Official Docs](https://firebase.google.com/docs)

---

## Support

Need help? Check:
1. Firebase Console for project settings
2. Browser DevTools Console for errors
3. Firebase Security Rules for permission issues
4. Documentation files in the project

---

**You're all set! Start building your solar energy management system! ☀️**
