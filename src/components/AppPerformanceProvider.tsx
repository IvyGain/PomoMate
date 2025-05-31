import React, { useEffect } from 'react';
import { AppState } from 'react-native';
import { useAppInitialization } from '../hooks/useAppInitialization';
import { NetworkStatusBanner } from './NetworkStatusBanner';
import offlineService from '../services/offlineService';

interface AppPerformanceProviderProps {
  children: React.ReactNode;
}

export const AppPerformanceProvider: React.FC<AppPerformanceProviderProps> = ({ children }) => {
  const { isInitialized } = useAppInitialization();

  useEffect(() => {
    // Sync offline data when app becomes active
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        offlineService.syncQueuedData().catch(console.error);
      }
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  useEffect(() => {
    // Initial sync when component mounts
    if (isInitialized) {
      offlineService.syncQueuedData().catch(console.error);
    }
  }, [isInitialized]);

  return (
    <>
      <NetworkStatusBanner />
      {children}
    </>
  );
};