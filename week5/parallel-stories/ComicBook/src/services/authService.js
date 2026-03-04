import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, firebaseInitialized, db } from '../firebase';
import { setDoc, getDoc, doc } from 'firebase/firestore';

/**
 * Register a new user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} displayName - User's display name
 * @returns {Promise<Object>} User object with profile data
 */
export async function registerUser(email, password, displayName) {
  if (!firebaseInitialized) {
    // Fallback: Store in localStorage
    const userId = 'local_' + Math.random().toString(36).substr(2, 9);
    const user = {
      uid: userId,
      email,
      displayName,
      reputation: 0,
      contributions: 0,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem(`user_${userId}`, JSON.stringify(user));
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
 * @returns {Promise<Object>} User object
 */
export async function loginUser(email, password) {
  if (!firebaseInitialized) {
    // Fallback: Use localStorage
    const username = prompt('Enter username:');
    if (!username) throw new Error('Username required');
    
    const userId = 'local_' + Math.random().toString(36).substr(2, 9);
    const user = {
      uid: userId,
      email,
      displayName: username,
      reputation: 0,
      contributions: 0,
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
 * Subscribe to auth state changes
 * @param {Function} callback - Called with user object or null
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
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          callback({ ...user, ...userDoc.data() });
        } else {
          callback(user);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        callback(user);
      }
    } else {
      callback(null);
    }
  });
}

/**
 * Get user profile by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User profile data
 */
export async function getUserProfile(userId) {
  if (!firebaseInitialized) {
    const stored = localStorage.getItem(`user_${userId}`);
    return stored ? JSON.parse(stored) : null;
  }

  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    return userDoc.exists() ? userDoc.data() : null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {Object} updates - Profile updates
 * @returns {Promise<void>}
 */
export async function updateUserProfile(userId, updates) {
  if (!firebaseInitialized) {
    const stored = JSON.parse(localStorage.getItem(`user_${userId}`) || '{}');
    localStorage.setItem(`user_${userId}`, JSON.stringify({ ...stored, ...updates }));
    return;
  }

  try {
    await setDoc(doc(db, 'users', userId), updates, { merge: true });
  } catch (error) {
    throw new Error(error.message);
  }
}
