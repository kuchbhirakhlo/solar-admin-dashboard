import { deleteApp, initializeApp } from 'firebase/app';
import { createUserWithEmailAndPassword, initializeAuth, inMemoryPersistence, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import app, { auth, db } from '@/lib/firebase';

export async function withEmployeeAccount<T>(
  email: string,
  password: string,
  saveRecords: (uid: string) => Promise<T>
): Promise<T> {
  await auth.authStateReady();
  const admin = auth.currentUser;
  if (!admin) throw new Error('Sign in as an administrator before creating employees.');

  const profiles = await Promise.all(
    ['users', 'admins'].map((collection) => getDoc(doc(db, collection, admin.uid)))
  );
  if (!profiles.some((profile) => {
    const data = profile.data();
    return data?.role === 'admin' && [undefined, null, '', 'active'].includes(data.status);
  })) {
    throw new Error('Only administrators can create employees.');
  }

  // Keep the employee session separate from the admin used by Firestore.
  const temporaryApp = initializeApp(app.options, 'employee-' + crypto.randomUUID());
  try {
    const employeeAuth = initializeAuth(temporaryApp, { persistence: inMemoryPersistence });
    try {
      const { user } = await createUserWithEmailAndPassword(employeeAuth, email, password);
      return await saveRecords(user.uid);
    } finally {
      await signOut(employeeAuth).catch(() => {});
    }
  } finally {
    await deleteApp(temporaryApp).catch(() => {});
  }
}
