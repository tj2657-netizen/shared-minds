import { useState, useEffect } from 'react';
import { hasUserUpvoted, getUpvoteCount } from '../services/reputationService';

/**
 * Hook for managing reputation/upvote functionality
 * @param {string} frameId - Frame ID to track
 * @param {string|null} userId - Optional user ID
 * @returns {Object} Upvote count, has upvoted, loading state
 */
export function useReputation(frameId, userId = null) {
  const [upvoteCount, setUpvoteCount] = useState(0);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUpvoteData = async () => {
      setLoading(true);
      try {
        const count = await getUpvoteCount(frameId);
        setUpvoteCount(count);

        if (userId) {
          const upvoted = await hasUserUpvoted(frameId, userId);
          setHasUpvoted(upvoted);
        }
      } catch (error) {
        console.error('Error loading upvote data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUpvoteData();
  }, [frameId, userId]);

  return { upvoteCount, hasUpvoted, loading };
}
