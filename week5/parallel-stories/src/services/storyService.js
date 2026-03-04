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
} from 'firebase/firestore';
import { db, firebaseInitialized } from './firebase';

/**
 * Create a new story (root frame)
 * @param {string} title - Story title
 * @param {string} firstFrameContent - Content of the first frame
 * @param {string} authorId - Author's user ID
 * @returns {Promise<string>} Story ID
 */
export async function createStory(title, firstFrameContent, authorId) {
  if (!firebaseInitialized) {
    // Fallback: Store in localStorage
    const storyId = 'story_' + Math.random().toString(36).substr(2, 9);
    const stories = JSON.parse(localStorage.getItem('stories') || '[]');
    stories.push({
      id: storyId,
      title,
      authorId,
      createdAt: new Date().toISOString(),
      firstFrame: firstFrameContent,
    });
    localStorage.setItem('stories', JSON.stringify(stories));
    return storyId;
  }

  try {
    const storiesRef = collection(db, 'stories');
    const storyDoc = await addDoc(storiesRef, {
      title,
      authorId,
      createdAt: new Date(),
      updated: new Date(),
    });

    // Add root frame
    await addDoc(collection(db, 'stories', storyDoc.id, 'frames'), {
      content: firstFrameContent,
      authorId,
      parentFrameId: null, // Root frame
      imageUrl: null,
      timestamp: new Date(),
      upvoteCount: 0,
    });

    return storyDoc.id;
  } catch (error) {
    throw new Error('Failed to create story: ' + error.message);
  }
}

/**
 * Get all stories
 * @returns {Promise<Array>} Array of story objects
 */
export async function getAllStories() {
  if (!firebaseInitialized) {
    return JSON.parse(localStorage.getItem('stories') || '[]');
  }

  try {
    const storiesRef = collection(db, 'stories');
    const q = query(storiesRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    const stories = [];
    for (const doc of snapshot.docs) {
      const framesSnapshot = await getDocs(collection(db, 'stories', doc.id, 'frames'));
      const frames = framesSnapshot.docs.map((frame) => ({
        id: frame.id,
        ...frame.data(),
      }));

      stories.push({
        id: doc.id,
        ...doc.data(),
        frames,
      });
    }

    return stories;
  } catch (error) {
    console.error('Error fetching stories:', error);
    return [];
  }
}

/**
 * Get a specific story by ID
 * @param {string} storyId - Story ID
 * @returns {Promise<Object>} Story object with frames
 */
export async function getStory(storyId) {
  if (!firebaseInitialized) {
    const stories = JSON.parse(localStorage.getItem('stories') || '[]');
    return stories.find((s) => s.id === storyId) || null;
  }

  try {
    const storyDoc = await getDoc(doc(db, 'stories', storyId));
    if (!storyDoc.exists()) {
      return null;
    }

    // Fetch all frames for this story
    const framesSnapshot = await getDocs(collection(db, 'stories', storyId, 'frames'));
    const frames = framesSnapshot.docs.map((frame) => ({
      id: frame.id,
      ...frame.data(),
    }));

    return {
      id: storyDoc.id,
      ...storyDoc.data(),
      frames,
    };
  } catch (error) {
    console.error('Error fetching story:', error);
    return null;
  }
}

/**
 * Add a new frame to a story (creates a branch)
 * @param {string} storyId - Story ID
 * @param {string} content - Frame content
 * @param {string} parentFrameId - ID of parent frame
 * @param {string} authorId - Author's user ID
 * @param {string|null} imageUrl - Optional image URL
 * @returns {Promise<string>} Frame ID
 */
export async function addFrameToStory(
  storyId,
  content,
  parentFrameId,
  authorId,
  imageUrl = null
) {
  if (!firebaseInitialized) {
    // Fallback: Update story in localStorage
    const stories = JSON.parse(localStorage.getItem('stories') || '[]');
    const storyIndex = stories.findIndex((s) => s.id === storyId);
    if (storyIndex >= 0) {
      const frameId = 'frame_' + Math.random().toString(36).substr(2, 9);
      stories[storyIndex].frames = stories[storyIndex].frames || [];
      stories[storyIndex].frames.push({
        id: frameId,
        content,
        parentFrameId,
        authorId,
        imageUrl,
        timestamp: new Date().toISOString(),
        upvoteCount: 0,
      });
      localStorage.setItem('stories', JSON.stringify(stories));
      return frameId;
    }
    throw new Error('Story not found');
  }

  try {
    const frameDoc = await addDoc(collection(db, 'stories', storyId, 'frames'), {
      content,
      authorId,
      parentFrameId,
      imageUrl,
      timestamp: new Date(),
      upvoteCount: 0,
    });

    return frameDoc.id;
  } catch (error) {
    throw new Error('Failed to add frame: ' + error.message);
  }
}

/**
 * Get frames for a specific story
 * @param {string} storyId - Story ID
 * @returns {Promise<Array>} Array of frame objects
 */
export async function getStoryFrames(storyId) {
  if (!firebaseInitialized) {
    const stories = JSON.parse(localStorage.getItem('stories') || '[]');
    const story = stories.find((s) => s.id === storyId);
    return story?.frames || [];
  }

  try {
    const framesSnapshot = await getDocs(collection(db, 'stories', storyId, 'frames'));
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
 * Get user's stories
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of user's stories
 */
export async function getUserStories(userId) {
  if (!firebaseInitialized) {
    const stories = JSON.parse(localStorage.getItem('stories') || '[]');
    return stories.filter((s) => s.authorId === userId);
  }

  try {
    const storiesRef = collection(db, 'stories');
    const q = query(
      storiesRef,
      where('authorId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);

    const stories = [];
    for (const doc of snapshot.docs) {
      const framesSnapshot = await getDocs(collection(db, 'stories', doc.id, 'frames'));
      const frames = framesSnapshot.docs.map((frame) => ({
        id: frame.id,
        ...frame.data(),
      }));

      stories.push({
        id: doc.id,
        ...doc.data(),
        frames,
      });
    }

    return stories;
  } catch (error) {
    console.error('Error fetching user stories:', error);
    return [];
  }
}

/**
 * Mock AI suggestion for story continuation
 * @param {string} previousContent - Content of previous frame
 * @returns {string} Suggested continuation
 */
export function generateAISuggestion(previousContent) {
  // Mock AI responses - in production, call actual API (OpenAI, Anthropic, etc.)
  const suggestions = [
    'Suddenly, everything changed when they discovered the truth...',
    'In that moment, they realized they had been wrong all along...',
    'As the sun rose on a new day, new possibilities emerged...',
    'The choice they made would echo through the ages...',
    'What they didn\'t know was that this was just the beginning...',
    'Time seemed to stop as the significance of what happened sank in...',
    'On the other side of the coin, a completely different story was unfolding...',
    'The answer was simpler than they had ever imagined...',
    'And so, fate intervened in the most unexpected way...',
    'The pieces of the puzzle finally fell into place...',
  ];

  return suggestions[Math.floor(Math.random() * suggestions.length)];
}
