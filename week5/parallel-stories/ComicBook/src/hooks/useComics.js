import { useState, useEffect } from 'react';
import { getComic, getAllComics, getUserComics } from '../services/comicService';

/**
 * Hook to manage comic data
 * @param {string} comicId - Optional comic ID to load specific comic
 * @param {string} userId - Optional user ID to load user's comics
 */
export function useComics(comicId = null, userId = null) {
  const [comics, setComics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadComics = async () => {
      setLoading(true);
      setError(null);
      try {
        let data;
        if (comicId) {
          data = await getComic(comicId);
          setComics(data ? [data] : []);
        } else if (userId) {
          data = await getUserComics(userId);
          setComics(data);
        } else {
          data = await getAllComics();
          setComics(data);
        }
      } catch (err) {
        setError(err.message);
        console.error('Error loading comics:', err);
      } finally {
        setLoading(false);
      }
    };

    loadComics();
  }, [comicId, userId]);

  return { comics, loading, error };
}
