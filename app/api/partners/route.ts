import { NextResponse } from 'next/server';
import { normalizePartnerPhone } from '@/lib/partner-phone';

export const runtime = 'nodejs';

function diagnosticText(value: unknown, token: string) {
  if (typeof value !== 'string') return undefined;
  return value
    .split(token).join('[REDACTED TOKEN]')
    .replace(/-----BEGIN [^-]*PRIVATE KEY-----[\s\S]*?-----END [^-]*PRIVATE KEY-----/g, '[REDACTED PRIVATE KEY]');
}

export async function POST(request: Request) {
  const token = request.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1];
  if (!token) return NextResponse.json({ error: 'Sign in as an administrator.' }, { status: 401 });

  let stage = 'loading Firebase Admin SDK';
  try {
    // Keep SDK loading inside the error boundary so initialization failures
    // return JSON instead of Next.js's HTML error page.
    const { getFirebaseAdmin } = await import('@/lib/firebase-admin');
    stage = 'initializing Firebase Admin';
    const { auth, db } = getFirebaseAdmin();
    stage = 'verifying administrator token';
    let uid: string;
    try {
      uid = (await auth.verifyIdToken(token, true)).uid;
    } catch (error) {
      const code = (error as { code?: string }).code;
      if (!['auth/argument-error', 'auth/invalid-id-token', 'auth/id-token-expired',
        'auth/id-token-revoked', 'auth/user-disabled', 'auth/user-not-found'].includes(code || '')) {
        throw error;
      }
      return NextResponse.json({ error: 'Your session has expired. Sign in again.' }, { status: 401 });
    }
    stage = 'reading administrator profile';
    const profiles = await db.getAll(db.doc(`users/${uid}`), db.doc(`admins/${uid}`));
    if (!profiles.some((profile) => {
      const data = profile.data();
      return data?.role === 'admin' && [undefined, null, '', 'active'].includes(data.status);
    })) {
      return NextResponse.json({ error: 'Only administrators can create partners.' }, { status: 403 });
    }

    let input;
    try { input = await request.json(); } catch {
      return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
    }
    if (!input || typeof input.name !== 'string' || !input.name.trim()
      || typeof input.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())
      || typeof input.phone !== 'string'
      || !['agent', 'partner'].includes(input.role)
      || !['active', 'inactive', 'suspended'].includes(input.status)) {
      return NextResponse.json({ error: 'Provide a name, valid email, phone, partner role, and status.' }, { status: 400 });
    }
    let phoneNumber: string;
    try { phoneNumber = normalizePartnerPhone(input.phone); } catch (error) {
      return NextResponse.json({ error: (error as Error).message }, { status: 400 });
    }
    const email = input.email.trim().toLowerCase();
    stage = 'checking existing partner';
    const existing = await db.collection('users').where('email', '==', email).limit(1).get();
    if (!existing.empty) {
      return NextResponse.json({ error: 'This email already has a user profile.' }, { status: 409 });
    }
    stage = 'creating partner Auth account';
    const user = await auth.createUser({ displayName: input.name.trim(), email, phoneNumber });
    const now = new Date().toISOString();
    const profile = {
      name: input.name.trim(), email, phone: phoneNumber.slice(3),
      role: input.role, status: input.status, createdAt: now, updatedAt: now,
    };
    try {
      stage = 'saving partner profiles';
      const batch = db.batch();
      batch.create(db.doc(`users/${user.uid}`), profile);
      batch.create(db.collection('Partner').doc(), { ...profile, uid: user.uid, role: 'partner' });
      await batch.commit();
    } catch (error) {
      // Remove only the account this request created if saving its profiles fails.
      await auth.deleteUser(user.uid).catch(() => {
        console.error('Partner creation rollback failed for UID:', user.uid);
      });
      throw error;
    }
    return NextResponse.json({ uid: user.uid }, { status: 201 });
  } catch (error) {
    const details = error as { code?: string; name?: string; message?: string; stack?: string } | null;
    const code = details?.code;
    if (code === 'auth/phone-number-already-exists' || code === 'auth/email-already-exists') {
      return NextResponse.json({ error: 'This phone number or email is already registered in Firebase Authentication. Use the existing account.' }, { status: 409 });
    }
    // Keep exception details in server logs only. Never log the request or credentials.
    console.error('Partner creation failed:', {
      stage,
      code: diagnosticText(code, token) || 'unknown',
      name: diagnosticText(details?.name, token),
      message: diagnosticText(details?.message ?? (typeof error === 'string' ? error : undefined), token),
      stack: diagnosticText(details?.stack, token),
    });
    return NextResponse.json({ error: 'Could not create partner. Check the server Firebase Admin configuration and try again.' }, { status: 500 });
  }
}
