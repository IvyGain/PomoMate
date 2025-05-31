import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Slot, Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import {
  Platform,
  StatusBar,
  View,
  StyleSheet,
} from "react-native";
import { ErrorBoundary } from "./error-boundary";
import { useThemeStore } from "@/store/themeStore";
import { useAuthStore } from "@/store/authStore";
import { useSupabaseAuth } from "@/src/hooks/useSupabaseAuth";
import { useAuthCallback } from "@/src/hooks/useAuthCallback";
import "@/src/utils/webCompat";
import "@/src/utils/bindFix";

// グローバルエラーハンドラーでCSSエラーを抑制
if (typeof window !== 'undefined') {
  const originalError = console.error;
  console.error = (...args) => {
    const errorString = args[0]?.toString() || '';
    if (errorString.includes('Failed to set an indexed property') || 
        errorString.includes('CSSStyleDeclaration')) {
      console.warn('Suppressed CSS indexing error');
      return;
    }
    originalError.apply(console, args);
  };
}

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "index",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });

  const { theme } = useThemeStore();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();
  
  // Initialize Supabase auth listener
  useSupabaseAuth();
  
  // Handle auth callbacks (email confirmation, etc.)
  useAuthCallback();
  
  // Expose a loading state
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (error) {
      console.error(error);
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      // Delay hiding splash screen to ensure navigation is ready
      const timer = setTimeout(() => {
        SplashScreen.hideAsync();
        setIsReady(true);
      }, 500); // Increased timeout to ensure navigation is ready
      
      return () => clearTimeout(timer);
    }
  }, [loaded]);

  // Handle authentication-based navigation
  useEffect(() => {
    if (!isReady) return;

    // Simple navigation logic without segments
    const currentPath = window.location.pathname;
    const isAuthPath = currentPath.includes('/login') || 
                      currentPath.includes('/register') || 
                      currentPath.includes('/forgot-password');

    console.log('Navigation debug:', {
      currentPath,
      isAuthPath,
      isAuthenticated,
      isReady
    });

    if (!isAuthenticated && !isAuthPath) {
      // Redirect to login if not authenticated
      console.log('Redirecting to login: not authenticated and not on auth path');
      setTimeout(() => router.replace('/login'), 100);
    } else if (isAuthenticated && isAuthPath) {
      // Redirect to home if authenticated and on auth page (temporarily disabled for debugging)
      console.log('Would redirect to home: authenticated and on auth path (disabled for debugging)');
      // setTimeout(() => router.replace('/(tabs)'), 100);
    }
  }, [isAuthenticated, isReady]);

  if (!loaded || !isReady) {
    return null;
  }

  return (
    <ErrorBoundary>
      <StatusBar barStyle="light-content" backgroundColor={theme.background} />
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: theme.background,
            },
            headerTintColor: theme.text,
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            contentStyle: {
              backgroundColor: theme.background,
            },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: "modal" }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="register" options={{ title: "新規登録" }} />
          <Stack.Screen name="forgot-password" options={{ title: "パスワードをお忘れの方" }} />
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