import { useEffect } from 'react';
import { Platform } from 'react-native';

export function usePWA() {
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/service-worker.js')
          .then((registration) => {
            console.log('[PWA] ServiceWorker registration successful:', registration.scope);
          })
          .catch((error) => {
            console.log('[PWA] ServiceWorker registration failed:', error);
          });
      });
    }

    let deferredPrompt: any;
    
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      deferredPrompt = e;
      console.log('[PWA] Install prompt saved');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const handleAppInstalled = () => {
      console.log('[PWA] App was installed');
      deferredPrompt = null;
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);
}
