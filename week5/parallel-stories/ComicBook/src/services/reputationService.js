import {
  collection,
  addDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { db, firebaseInitialized } from '../firebase';
import { updateUserProfile, getUserProfile } from './authService';

/**
 * Upvote a frame
 * @param {string} comicId - Comic ID
 * @param {string} frameId - Frame ID
 * @param {string} userId - User upvoting
 * @param {string} authorId - Frame author ID
 * @returns {Promise<void>}
 */
export async function upvoteFrame(comicId, frameId, userId, authorId) {
  if (!firebaseInitialized) {
    // Fallback: Store upvotes in localStorage
    const upvotes = JSON.parse(localStorage.getItem('upvotes') || '[]');
    
    // Check if already upvoted
    const alreadyUpvoted = upvotes.some(
      (u) => u.frameId === frameId && u.userId === userId
    );

    if (!alreadyUpvoted) {
      upvotes.push({
        frameId,
        comicId,
        userId,
        authorId,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem('upvotes', JSON.stringify(upvotes));

      // Update frame upvote count
      const frames = JSON.parse(localStorage.getItem('frames') || '[]');
      const frameIndex = frames.findIndex((f) => f.id === frameId);
      if (frameIndex >= 0) {
        frames[frameIndex].upvoteCount = (frames[frameIndex].upvoteCount || 0) + 1;
        localStorage.setItem('frames', JSON.stringify(frames));
      }

      // Update author reputation
      const user = JSON.parse(localStorage.getItem(`user_${authorId}`) || '{}');
      user.reputation = (user.reputation || 0) + 1;
      localStorage.setItem(`user_${authorId}`, JSON.stringify(user));
    }
    return;
  }

  try {
    // Check if already upvoted
    const upvotesRef = collection(db, 'upvotes');
    const q = query(
      upvotesRef,
      where('frameId', '==', frameId),
      where('userId', '==', userId)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      // Add upvote
      await addDoc(upvotesRef, {
        comicId,
        frameId,
        userId,
        authorId,
        timestamp: new Date(),
      });

      // Increment frame upvote count
      const frameRef = doc(db, 'comics', comicId, 'frames', frameId);
      await updateDoc(frameRef, {
        upvoteCount: (__i) => (__i || 0) + 1,
      });

      // Increment user reputation
      const userProfile = await getUserProfile(authorId);
      if (userProfile) {
        await updateUserProfile(authorId, {
          reputation: (userProfile.reputation || 0) + 1,
        });
      }
    }
  } catch (error) {
    console.error('Error upvoting frame:', error);
  }
}

/**
 * Remove upvote from a frame
 * @param {string} comicId - Comic ID
 * @param {string} frameId - Frame ID
 * @param {string} userId - User removing upvote
 * @param {string} authorId - Frame author ID
 * @returns {Promise<void>}
 */
export async function removeUpvote(comicId, frameId, userId, authorId) {
  if (!firebaseInitialized) {
    const upvotes = JSON.parse(localStorage.getItem('upvotes') || '[]');
    const filtered = upvotes.filter(
      (u) => !(u.frameId === frameId && u.userId === userId)
    );
    localStorage.setItem('upvotes', JSON.stringify(filtered));

    // Decrement frame upvote count
    const frames = JSON.parse(localStorage.getItem('frames') || '[]');
    const frameIndex = frames.findIndex((f) => f.id === frameId);
    if (frameIndex >= 0) {
      frames[frameIndex].upvoteCount = Math.max(0, (frames[frameIndex].upvoteCount || 1) - 1);
      localStorage.setItem('frames', JSON.stringify(frames));
    }

    // Decrement author reputation
    const user = JSON.parse(localStorage.getItem(`user_${authorId}`) || '{}');
    user.reputation = Math.max(0, (user.reputation || 1) - 1);
    localStorage.setItem(`user_${authorId}`, JSON.stringify(user));
    return;
  }

  try {
    const upvotesRef = collection(db, 'upvotes');
    const q = query(
      upvotesRef,
      where('frameId', '==', frameId),
      where('userId', '==', userId)
    );

    const snapshot = await getDocs(q);
    for (const upvoteDoc of snapshot.docs) {
      await deleteDoc(upvoteDoc.ref);
    }

    // Decrement frame upvote count
    const frameRef = doc(db, 'comics', comicId, 'frames', frameId);
    await updateDoc(frameRef, {
      upvoteCount: (__i) => Math.max(0, (__i || 1) - 1),
    });

    // Decrement user reputation
    const userProfile = await getUserProfile(authorId);
    if (userProfile) {
      await updateUserProfile(authorId, {
        reputation: Math.max(0, (userProfile.reputation || 1) - 1),
      });
    }
  } catch (error) {
    console.error('Error removing upvote:', error);
  }
}

/**
 * Check if user has upvoted a frame
 * @param {string} frameId - Frame ID
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} True if upvoted
 */
export async function hasUserUpvoted(frameId, userId) {
  if (!firebaseInitialized) {
    const upvotes = JSON.parse(localStorage.getItem('upvotes') || '[]');
    return upvotes.some((u) => u.frameId === frameId && u.userId === userId);
  }

  try {
    const upvotesRef = collection(db, 'upvotes');
    const q = query(
      upvotesRef,
      where('frameId', '==', frameId),
      where('userId', '==', userId)
    );

    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking upvote:', error);
    return false;
  }
}

/**
 * Get upvote count for a frame
 * @param {string} frameId - Frame ID
 * @returns {Promise<number>} Number of upvotes
 */
export async function getUpvoteCount(frameId) {
  if (!firebaseInitialized) {
    const upvotes = JSON.parse(localStorage.getItem('upvotes') || '[]');
    return upvotes.filter((u) => u.frameId === frameId).length;
  }

  try {
    const upvotesRef = collection(db, 'upvotes');
    const q = query(upvotesRef, where('frameId', '==', frameId));
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error('Error getting upvote count:', error);
    return 0;
  }
}
