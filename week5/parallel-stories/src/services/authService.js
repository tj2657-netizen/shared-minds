import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, firebaseInitialized } from './firebase';
import { setDoc, getDoc, doc } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Register a new user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} displayName - User's display name
 * @returns {Promise<Object>} User object or error
 */
export async function registerUser(email, password, displayName) {
  if (!firebaseInitialized) {
    // Fallback: Store user in localStorage
    const user = {
      uid: 'local_' + Math.random().toString(36).substr(2, 9),
      email,
      displayName,
      createdAt: new Date(),
    };
    localStorage.setItem('currentUser', JSON.stringify(user));
    return user;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create user profile in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      displayName,
      email,
      reputation: 0,
      contributions: 0,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`,
      createdAt: new Date(),
    });

    return user;
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Login user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User object or error
 */
export async function loginUser(email, password) {
  if (!firebaseInitialized) {
    // Fallback: Check localStorage
    const user = {
      uid: 'local_' + Math.random().toString(36).substr(2, 9),
      email,
      displayName: email.split('@')[0],
    };
    localStorage.setItem('currentUser', JSON.stringify(user));
    return user;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Logout current user
 * @returns {Promise<void>}
 */
export async function logoutUser() {
  if (!firebaseInitialized) {
    localStorage.removeItem('currentUser');
    return;
  }

  try {
    await signOut(auth);
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Get current authenticated user
 * @param {Function} callback - Callback function when auth state changes
 * @returns {Function} Unsubscribe function
 */
export function onUserStateChange(callback) {
  if (!firebaseInitialized) {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      callback(JSON.parse(storedUser));
    } else {
      callback(null);
    }
    return () => {};
  }

  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Fetch additional user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        callback({ ...user, ...userDoc.data() });
      } else {
        callback(user);
      }
    } else {
      callback(null);
    }
  });
}

/**
 * Get user profile data
 * @param {string} uid - User ID
 * @returns {Promise<Object>} User profile data
 */
export async function getUserProfile(uid) {
  if (!firebaseInitialized) {
    const storedUser = localStorage.getItem('currentUser');
    return storedUser ? JSON.parse(storedUser) : null;
  }

  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    return userDoc.exists() ? userDoc.data() : null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

/**
 * Update user profile
 * @param {string} uid - User ID
 * @param {Object} updates - Profile updates
 * @returns {Promise<void>}
 */
export async function updateUserProfile(uid, updates) {
  if (!firebaseInitialized) {
    const storedUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    localStorage.setItem('currentUser', JSON.stringify({ ...storedUser, ...updates }));
    return;
  }

  try {
    await setDoc(doc(db, 'users', uid), updates, { merge: true });
  } catch (error) {
    throw new Error(error.message);
  }
}
