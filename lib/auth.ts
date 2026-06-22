import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  type User,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export interface AdminUser {
  uid: string;
  email: string;
  role: string;
  displayName?: string;
}

export async function loginWithEmail(email: string, password: string) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const user = result.user;

    // Check if user exists in Firestore users collection with admin role
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      await signOut(auth);
      throw new Error('User not found. Please contact an administrator.');
    }

    const userData = userDoc.data();
    
    if (userData.role !== 'admin') {
      await signOut(auth);
      throw new Error('Access denied. Only admin accounts can access this dashboard.');
    }

    // Get ID token and store in HTTP-only cookie for server-side auth checks
    const idToken = await user.getIdToken();
    
    return { user, userData: userData as AdminUser, idToken };
  } catch (error) {
    // If it's already one of our custom errors, re-throw as-is
    if (error instanceof Error && (
      error.message === 'User not found. Please contact an administrator.' ||
      error.message === 'Access denied. Only admin accounts can access this dashboard.'
    )) {
      throw error;
    }
    throw new Error(error instanceof Error ? error.message : 'Login failed');
  }
}

export async function registerWithEmail(
  email: string,
  password: string,
  displayName: string
) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName });
    return result.user;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Registration failed');
  }
}

export async function logout() {
  try {
    await signOut(auth);
    // Clear the session cookie on client side
    if (typeof document !== 'undefined') {
      document.cookie = 'session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax';
    }
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Logout failed');
  }
}

export async function resetPassword(email: string) {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Password reset failed');
  }
}

export async function updateUserProfile(user: User, updates: { displayName?: string }) {
  try {
    await updateProfile(user, updates);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Profile update failed');
  }
}