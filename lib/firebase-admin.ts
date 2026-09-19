import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Import only from server routes. Never expose service-account credentials to the browser.
export function getFirebaseAdmin() {
  const existingApp = getApps().find((app) => app.name === 'server-admin');
  if (existingApp) return { auth: getAuth(existingApp), db: getFirestore(existingApp) };

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');
  // Vercel has no Google Application Default Credentials. Fail immediately
  // instead of attempting metadata-server discovery with missing credentials.
  if ((process.env.VERCEL || clientEmail || privateKey) && (!projectId || !clientEmail || !privateKey)) {
    throw Object.assign(new Error('Firebase Admin service-account configuration is incomplete.'), {
      code: 'admin/missing-credentials',
    });
  }
  const app = initializeApp({
    projectId,
    credential: clientEmail && privateKey
      ? cert({ projectId, clientEmail, privateKey })
      : applicationDefault(),
  }, 'server-admin');
  return { auth: getAuth(app), db: getFirestore(app) };
}
