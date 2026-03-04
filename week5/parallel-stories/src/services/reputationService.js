import { collection, addDoc, query, where, getDocs, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db, firebaseInitialized } from './firebase';
import { updateUserProfile } from './authService';

/**
 * Upvote a story frame
 * @param {string} frameId - Frame ID to upvote
 * @param {string} userId - User ID doing the upvote
 * @param {string} authorId - Author ID of the frame
 * @param {string} storyId - Story ID (for Firebase path)
 * @returns {Promise<void>}
 */
export async function upvoteFrame(frameId, userId, authorId, storyId) {
  if (!firebaseInitialized) {
    // Fallback: Store upvotes in localStorage
    const upvotes = JSON.parse(localStorage.getItem('upvotes') || '[]');
    const upvoteExists = upvotes.some(
      (u) => u.frameId === frameId && u.userId === userId
    );

    if (!upvoteExists) {
      upvotes.push({
        frameId,
        userId,
        authorId,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem('upvotes', JSON.stringify(upvotes));

      // Update author reputation
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex((u) => u.uid === authorId);
      if (userIndex >= 0) {
        users[userIndex].reputation = (users[userIndex].reputation || 0) + 1;
        localStorage.setItem('users', JSON.stringify(users));
      }
    }
    return;
  }

  try {
    // Check if user already upvoted this frame
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
        frameId,
        storyId,
        userId,
        authorId,
        timestamp: new Date(),
      });

      // Increment author reputation
      const userDoc = await getDoc(doc(db, 'users', authorId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        await updateUserProfile(authorId, {
          reputation: (userData.reputation || 0) + 1,
        });
      }
    }
  } catch (error) {
    console.error('Error upvoting frame:', error);
    throw new Error('Failed to upvote frame: ' + error.message);
  }
}

/**
 * Remove upvote from a frame
 * @param {string} frameId - Frame ID
 * @param {string} userId - User ID
 * @param {string} authorId - Author ID of the frame
 * @returns {Promise<void>}
 */
export async function removeUpvote(frameId, userId, authorId) {
  if (!firebaseInitialized) {
    // Fallback: Remove from localStorage
    const upvotes = JSON.parse(localStorage.getItem('upvotes') || '[]');
    const updatedUpvotes = upvotes.filter(
      (u) => !(u.frameId === frameId && u.userId === userId)
    );
    localStorage.setItem('upvotes', JSON.stringify(updatedUpvotes));

    // Decrement author reputation
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex((u) => u.uid === authorId);
    if (userIndex >= 0) {
      users[userIndex].reputation = Math.max(0, (users[userIndex].reputation || 1) - 1);
      localStorage.setItem('users', JSON.stringify(users));
    }
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

    for (const doc of snapshot.docs) {
      await deleteDoc(doc.ref);

      // Decrement author reputation
      const userDoc = await getDoc(doc(db, 'users', authorId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        await updateUserProfile(authorId, {
          reputation: Math.max(0, (userData.reputation || 1) - 1),
        });
      }
    }
  } catch (error) {
    console.error('Error removing upvote:', error);
    throw new Error('Failed to remove upvote: ' + error.message);
  }
}

/**
 * Check if user has upvoted a frame
 * @param {string} frameId - Frame ID
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} True if user has upvoted
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
