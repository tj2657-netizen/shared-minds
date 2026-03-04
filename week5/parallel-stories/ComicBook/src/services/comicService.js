import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  doc,
  query,
  where,
  orderBy,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db, firebaseInitialized } from '../firebase';
import { v4 as uuidv4 } from 'uuid';

/**
 * Create the initial frame (root of the comic)
 * @param {string} title - Comic title
 * @param {string} textContent - Frame dialogue/narration
 * @param {string} imageUrl - Frame image URL
 * @param {string} authorId - Creator's user ID
 * @returns {Promise<string>} Comic ID
 */
export async function createComic(title, textContent, imageUrl, authorId) {
  if (!firebaseInitialized) {
    // Fallback: Store in localStorage
    const comicId = uuidv4();
    const frameId = uuidv4();
    
    const frame = {
      id: frameId,
      comicId,
      textContent,
      imageUrl,
      authorId,
      parentId: null,
      createdAt: new Date().toISOString(),
      upvoteCount: 0,
    };

    const comic = {
      id: comicId,
      title,
      authorId,
      createdAt: new Date().toISOString(),
      rootFrameId: frameId,
    };

    const comics = JSON.parse(localStorage.getItem('comics') || '[]');
    comics.push(comic);
    localStorage.setItem('comics', JSON.stringify(comics));

    const frames = JSON.parse(localStorage.getItem('frames') || '[]');
    frames.push(frame);
    localStorage.setItem('frames', JSON.stringify(frames));

    return comicId;
  }

  try {
    // Create comic document
    const comicsRef = collection(db, 'comics');
    const comicDoc = await addDoc(comicsRef, {
      title,
      authorId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create root frame
    const framesRef = collection(db, 'comics', comicDoc.id, 'frames');
    await addDoc(framesRef, {
      textContent,
      imageUrl,
      authorId,
      parentId: null, // Root frame has no parent
      createdAt: new Date(),
      upvoteCount: 0,
      upvoters: [], // Array to track who upvoted
    });

    return comicDoc.id;
  } catch (error) {
    throw new Error('Failed to create comic: ' + error.message);
  }
}

/**
 * Get a comic with all its frames
 * @param {string} comicId - Comic ID
 * @returns {Promise<Object>} Comic object with frames array
 */
export async function getComic(comicId) {
  if (!firebaseInitialized) {
    const comics = JSON.parse(localStorage.getItem('comics') || '[]');
    const comic = comics.find((c) => c.id === comicId);
    if (!comic) return null;

    const frames = JSON.parse(localStorage.getItem('frames') || '[]');
    const comicFrames = frames.filter((f) => f.comicId === comicId);

    return {
      ...comic,
      frames: comicFrames,
    };
  }

  try {
    const comicDoc = await getDoc(doc(db, 'comics', comicId));
    if (!comicDoc.exists()) return null;

    const framesSnapshot = await getDocs(
      collection(db, 'comics', comicId, 'frames')
    );
    const frames = framesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return {
      id: comicDoc.id,
      ...comicDoc.data(),
      frames,
    };
  } catch (error) {
    console.error('Error fetching comic:', error);
    return null;
  }
}

/**
 * Get all comics (for browse view)
 * @returns {Promise<Array>} Array of comic objects
 */
export async function getAllComics() {
  if (!firebaseInitialized) {
    return JSON.parse(localStorage.getItem('comics') || '[]');
  }

  try {
    const comicsRef = collection(db, 'comics');
    const q = query(comicsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    const comics = [];
    for (const doc of snapshot.docs) {
      const framesSnapshot = await getDocs(
        collection(db, 'comics', doc.id, 'frames')
      );
      const frameCount = framesSnapshot.size;

      comics.push({
        id: doc.id,
        ...doc.data(),
        frameCount,
      });
    }

    return comics;
  } catch (error) {
    console.error('Error fetching comics:', error);
    return [];
  }
}

/**
 * Add a new frame (continuation) to a comic
 * @param {string} comicId - Comic ID
 * @param {string} textContent - Frame text
 * @param {string} imageUrl - Frame image
 * @param {string} parentFrameId - ID of parent frame
 * @param {string} authorId - Creator's user ID
 * @returns {Promise<string>} New frame ID
 */
export async function addFrameToComic(
  comicId,
  textContent,
  imageUrl,
  parentFrameId,
  authorId
) {
  if (!firebaseInitialized) {
    const frameId = uuidv4();
    const frame = {
      id: frameId,
      comicId,
      textContent,
      imageUrl,
      authorId,
      parentId: parentFrameId,
      createdAt: new Date().toISOString(),
      upvoteCount: 0,
    };

    const frames = JSON.parse(localStorage.getItem('frames') || '[]');
    frames.push(frame);
    localStorage.setItem('frames', JSON.stringify(frames));

    return frameId;
  }

  try {
    const framesRef = collection(db, 'comics', comicId, 'frames');
    const frameDoc = await addDoc(framesRef, {
      textContent,
      imageUrl,
      authorId,
      parentId: parentFrameId,
      createdAt: new Date(),
      upvoteCount: 0,
      upvoters: [],
    });

    return frameDoc.id;
  } catch (error) {
    throw new Error('Failed to add frame: ' + error.message);
  }
}

/**
 * Get frames for a specific comic
 * @param {string} comicId - Comic ID
 * @returns {Promise<Array>} Array of frames
 */
export async function getComicFrames(comicId) {
  if (!firebaseInitialized) {
    const frames = JSON.parse(localStorage.getItem('frames') || '[]');
    return frames.filter((f) => f.comicId === comicId);
  }

  try {
    const framesSnapshot = await getDocs(
      collection(db, 'comics', comicId, 'frames')
    );
    return framesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching frames:', error);
    return [];
  }
}

/**
 * Get user's comics
 * @param {string} userId - User ID
 * @returns {Promise<Array>} User's comics
 */
export async function getUserComics(userId) {
  if (!firebaseInitialized) {
    const comics = JSON.parse(localStorage.getItem('comics') || '[]');
    return comics.filter((c) => c.authorId === userId);
  }

  try {
    const comicsRef = collection(db, 'comics');
    const q = query(
      comicsRef,
      where('authorId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching user comics:', error);
    return [];
  }
}
