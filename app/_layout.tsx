// Apply web compatibility fixes first to prevent "Illegal invocation" errors
import '@/src/utils/webCompatibility';

// Suppress React Native animation warnings for web
if (typeof window !== 'undefined') {
  const originalConsoleWarn = console.warn;
  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('useNativeDriver') &&
      args[0].includes('not supported')
    ) {
      return; // Suppress this specific warning
    }
    originalConsoleWarn.apply(console, args);
  };
}

import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { StatusBar, View, StyleSheet } from 'react-native';
import { ErrorBoundary } from './error-boundary';
import { useThemeStore } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';
import { useAuthCallback } from '@/src/hooks/useAuthCallback';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });

  const { theme } = useThemeStore();
  const { isAuthenticated, checkAuth } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();
  
  const [isReady, setIsReady] = useState(false);
  
  // Handle auth callbacks (email confirmation, etc.)
  useAuthCallback();

  // 埋め込み環境の検出とロギング
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isEmbedded = window !== window.parent;
      console.log('🌐 Environment:', {
        embedded: isEmbedded,
        origin: window.location.origin,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
      });
      
      // 読み込み完了を通知
      if (window.__POMOMATE_HIDE_LOADING__) {
        window.__POMOMATE_HIDE_LOADING__();
      }
    }
  }, []);

  // Initialize auth check
  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      const timer = setTimeout(() => {
        SplashScreen.hideAsync();
        setIsReady(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [loaded]);

  // Enhanced authentication-based navigation
  useEffect(() => {
    if (!isReady) return;

    console.log('🔍 Navigation Debug:', {
      segments,
      isAuthenticated,
      currentPath: segments.join('/'),
      firstSegment: segments[0],
      segmentsLength: segments.length,
    });

    // Add a small delay to ensure auth state is stable
    const timer = setTimeout(() => {
      const firstSegment = segments?.[0];
      const currentPath = segments.join('/');
      
      console.log('🧭 Navigation check:', {
        isAuthenticated,
        firstSegment,
        currentPath,
        segmentsLength: segments.length,
        isReady
      });
      
      // Auth-related pages that don't require authentication
      const authPages = ['login', 'register', 'forgot-password', 'email-confirmed', 'email-sent'];
      const isAuthPage = authPages.includes(firstSegment || '');
      
      // Check if this is an auth callback URL
      const isAuthCallback = typeof window !== 'undefined' && 
        (window.location.search.includes('token_hash=') || 
         window.location.search.includes('access_token=') ||
         window.location.hash.includes('access_token='));
      
      // Don't redirect if we're processing an auth callback
      if (isAuthCallback) {
        console.log('🔗 Auth callback detected, skipping navigation redirect');
        return;
      }
      
      if (isAuthenticated) {
        // User is authenticated
        console.log('🔐 User is authenticated, checking if navigation needed');
        if (firstSegment === 'login' || firstSegment === 'register' || segments.length === 0 || firstSegment === 'forgot-password') {
          console.log('✅ Authenticated user on auth page, redirecting to main app');
          router.replace('/(tabs)');
        } else {
          console.log('✅ Authenticated user already on protected page');
        }
      } else {
        // User is not authenticated
        console.log('🔓 User not authenticated, checking if redirect needed');
        if (!isAuthPage && segments.length > 0) {
          console.log('❌ Not authenticated on protected page, redirecting to login');
          console.log('🧭 Current page:', firstSegment, 'Redirecting from logout?');
          router.replace('/login');
        } else if (segments.length === 0) {
          console.log('❌ Not authenticated on root, redirecting to login');
          router.replace('/login');
        } else {
          console.log('✅ User on auth page, no redirect needed');
        }
      }
    }, 100); // Small delay to prevent race conditions

    return () => clearTimeout(timer);
  }, [isAuthenticated, isReady, segments, router]);

  if (!loaded || !isReady) {
    return null;
  }

  return (
    <ErrorBoundary>
      <StatusBar barStyle="light-content" backgroundColor={theme.background} />
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: theme.background },
            headerTintColor: theme.text,
            headerTitleStyle: { fontWeight: 'bold' },
            contentStyle: { backgroundColor: theme.background },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="register" options={{ title: '新規登録' }} />
          <Stack.Screen name="forgot-password" options={{ title: 'パスワードリセット' }} />
          <Stack.Screen name="email-confirmed" options={{ headerShown: false }} />
          <Stack.Screen name="email-sent" options={{ title: 'メール送信完了' }} />
        </Stack>
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});