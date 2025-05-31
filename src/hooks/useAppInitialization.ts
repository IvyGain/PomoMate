import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';

export const useAppInitialization = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    const initialize = async () => {
      try {
        await checkAuth();
        setIsInitialized(true);
      } catch (error) {
        console.error('App initialization error:', error);
        setIsInitialized(true); // Continue even if auth check fails
      }
    };

    initialize();
  }, [checkAuth]);

  return { isInitialized };
};