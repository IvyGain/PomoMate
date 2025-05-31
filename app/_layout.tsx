// Apply binding fixes first to prevent "Illegal invocation" errors
import "@/src/utils/bindingFix";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { StatusBar, View, StyleSheet } from "react-native";
import { ErrorBoundary } from "./error-boundary";
import { useThemeStore } from "@/store/themeStore";
import { useAuthStore } from "@/store/authStore";

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

  // Simple authentication-based navigation
  useEffect(() => {
    if (!isReady) return;

    const inAuthGroup = segments[0] === 'login' || segments[0] === 'register' || segments[0] === 'forgot-password';
    
    if (!isAuthenticated && !inAuthGroup) {
      // Not authenticated and not on auth page -> go to login
      router.replace('/login');
    } else if (isAuthenticated && (inAuthGroup || segments.length === 0)) {
      // Authenticated and on auth page or root -> go to home
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isReady, segments]);

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
          <Stack.Screen name="register" options={{ title: "新規登録" }} />
          <Stack.Screen name="forgot-password" options={{ title: "パスワードリセット" }} />
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