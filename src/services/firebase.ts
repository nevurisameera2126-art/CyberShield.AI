import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  deleteUser, 
  onAuthStateChanged, 
  User, 
  Auth 
} from 'firebase/auth';
import { 
  getFirestore, 
  Firestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs 
} from 'firebase/firestore';

export interface FirebaseConfigStatus {
  isConfigured: boolean;
  missingKeys: string[];
  projectId?: string;
  authDomain?: string;
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

export function getFirebaseConfigStatus(): FirebaseConfigStatus {
  const missingKeys: string[] = [];
  if (!firebaseConfig.apiKey) missingKeys.push('VITE_FIREBASE_API_KEY');
  if (!firebaseConfig.authDomain) missingKeys.push('VITE_FIREBASE_AUTH_DOMAIN');
  if (!firebaseConfig.projectId) missingKeys.push('VITE_FIREBASE_PROJECT_ID');
  if (!firebaseConfig.appId) missingKeys.push('VITE_FIREBASE_APP_ID');

  return {
    isConfigured: missingKeys.length === 0,
    missingKeys,
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain
  };
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

const status = getFirebaseConfigStatus();

if (status.isConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (err) {
    console.warn('Firebase initialization error:', err);
  }
}

// Google Auth Provider configured with strict Principle of Least Privilege:
// Requests ONLY standard profile & email. NEVER asks for phone numbers, contacts, or drive access.
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const isFirebaseConfigured = status.isConfigured && Boolean(auth);

export { auth, db };

/**
 * Initiates Google Sign-In via Firebase popup.
 * Never requests or collects user passwords or OTPs.
 */
export async function signInWithGoogle(): Promise<{ success: boolean; user?: User; error?: string }> {
  if (!isFirebaseConfigured || !auth) {
    return {
      success: false,
      error: 'Firebase is not yet configured. Please add VITE_FIREBASE_API_KEY and project credentials to your environment.'
    };
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Record minimal profile in Firestore if db is ready
    if (db && user) {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        lastLogin: Date.now()
      }, { merge: true });
    }

    return { success: true, user };
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    if (err.code === 'auth/popup-closed-by-user') {
      return { success: false, error: 'Sign-in window was closed before completion.' };
    }
    return { success: false, error: err.message || 'Failed to authenticate with Google.' };
  }
}

/**
 * Signs out the current authenticated user.
 */
export async function signOutUser(): Promise<{ success: boolean; error?: string }> {
  if (!auth) return { success: true };
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: unknown) {
    const err = error as { message?: string };
    return { success: false, error: err.message || 'Failed to sign out.' };
  }
}

/**
 * Permanently deletes the user account and purges their data.
 */
export async function deleteUserAccount(): Promise<{ success: boolean; error?: string }> {
  if (!auth || !auth.currentUser) {
    return { success: false, error: 'No active authenticated session.' };
  }

  const currentUser = auth.currentUser;
  const uid = currentUser.uid;

  try {
    // 1. Delete Firestore user document and subcollections if db is initialized
    if (db) {
      const userDocRef = doc(db, 'users', uid);
      // Clean up scans subcollection
      try {
        const scansCol = collection(db, 'users', uid, 'scans');
        const scanDocs = await getDocs(scansCol);
        for (const sDoc of scanDocs.docs) {
          await deleteDoc(sDoc.ref);
        }
      } catch (subErr) {
        console.warn('Error cleaning up subcollections:', subErr);
      }

      await deleteDoc(userDocRef);
    }

    // 2. Notify backend to clear any server-side cache/state
    try {
      const idToken = await currentUser.getIdToken();
      await fetch('/api/user/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ uid })
      });
    } catch {
      // ignore server notification failure
    }

    // 3. Delete Firebase Auth user account
    await deleteUser(currentUser);
    return { success: true };
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    if (err.code === 'auth/requires-recent-login') {
      return {
        success: false,
        error: 'Security requirement: Deleting an account requires recent authentication. Please sign out and sign in again before deleting.'
      };
    }
    return { success: false, error: err.message || 'Account deletion failed.' };
  }
}

/**
 * Listens for authentication state transitions.
 */
export function subscribeToAuth(callback: (user: User | null) => void): () => void {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}
