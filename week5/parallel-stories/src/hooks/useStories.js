import { useState, useEffect } from 'react';
import { getAllStories, getStory, getUserStories } from '../services/storyService';

/**
 * Hook for managing stories data
 * @param {string|null} storyId - Optional specific story ID to load
 * @param {string|null} userId - Optional user ID to load their stories
 * @returns {Object} Stories, loading state, error
 */
export function useStories(storyId = null, userId = null) {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStories = async () => {
      setLoading(true);
      try {
        let data;
        if (storyId) {
          data = await getStory(storyId);
          setStories(data ? [data] : []);
        } else if (userId) {
          data = await getUserStories(userId);
          setStories(data);
        } else {
          data = await getAllStories();
          setStories(data);
        }
      } catch (err) {
        setError(err.message);
        console.error('Error loading stories:', err);
      } finally {
        setLoading(false);
      }
    };

    loadStories();
  }, [storyId, userId]);

  return { stories, loading, error };
}
