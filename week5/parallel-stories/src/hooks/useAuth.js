import { useState, useEffect } from 'react';
import { onUserStateChange } from '../services/authService';

/**
 * Hook for managing authentication state
 * @returns {Object} User object or null, loading state, error
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Subscribe to auth changes
    const unsubscribe = onUserStateChange((authUser) => {
      setUser(authUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading, error };
}
