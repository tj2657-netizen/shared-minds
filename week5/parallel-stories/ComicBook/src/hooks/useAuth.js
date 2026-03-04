import { useState, useEffect } from 'react';
import { onUserStateChange } from '../services/authService';

/**
 * Hook to manage authentication state
 * Returns user object when authenticated, null when not
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onUserStateChange((authUser) => {
      setUser(authUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading };
}
