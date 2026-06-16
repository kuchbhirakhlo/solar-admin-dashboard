import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  type User,
} from 'firebase/auth';
import { auth } from './firebase';

export async function loginWithEmail(email: string, password: string) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
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
