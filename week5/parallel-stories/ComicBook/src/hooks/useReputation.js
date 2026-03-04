import { useState, useEffect } from 'react';
import { hasUserUpvoted, getUpvoteCount } from '../services/reputationService';

/**
 * Hook to manage frame upvotes/reputation
 * @param {string} frameId - Frame ID to track
 * @param {string} userId - Optional user ID to check if upvoted
 */
export function useReputation(frameId, userId = null) {
  const [upvoteCount, setUpvoteCount] = useState(0);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const count = await getUpvoteCount(frameId);
        setUpvoteCount(count);

        if (userId) {
          const upvoted = await hasUserUpvoted(frameId, userId);
          setHasUpvoted(upvoted);
        }
      } catch (error) {
        console.error('Error loading reputation data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [frameId, userId]);

  return { upvoteCount, hasUpvoted, loading };
}
