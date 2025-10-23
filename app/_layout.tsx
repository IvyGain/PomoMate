import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import {
  StatusBar,
  View,
  StyleSheet,
} from "react-native";
import { ErrorBoundary } from "./error-boundary";
import { useThemeStore } from "@/store/themeStore";
import { useAuthStore } from "@/store/authStore";
import { useUserStore } from "@/store/userStore";
import { useSocialStore } from "@/store/socialStore";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc, trpcReactClient } from "@/lib/trpc";
import { usePWA } from "@/hooks/usePWA";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });

  const { theme } = useThemeStore();
  const { isAuthenticated } = useAuthStore();
  const { loadFromBackend } = useUserStore();
  const { loadFriendsFromBackend } = useSocialStore();
  const segments = useSegments();
  const router = useRouter();
  
  usePWA();
  
  // Expose a loading state
  const [isReady, setIsReady] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

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
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [loaded]);
  
  // Load data from backend when authenticated
  useEffect(() => {
    if (isAuthenticated && !dataLoaded) {
      const loadData = async () => {
        try {
          console.log('[APP] Loading user data from backend...');
          await Promise.all([
            loadFromBackend(),
            loadFriendsFromBackend(),
          ]);
          setDataLoaded(true);
          console.log('[APP] User data loaded successfully');
        } catch (error) {
          console.error('[APP] Failed to load user data:', error);
          // Continue anyway, local data will be used
          setDataLoaded(true);
        }
      };
      loadData();
    } else if (!isAuthenticated) {
      setDataLoaded(false);
    }
  }, [isAuthenticated, dataLoaded, loadFromBackend, loadFriendsFromBackend]);
  
  // Handle authentication routing
  useEffect(() => {
    if (!isReady || !loaded) return;
    
    console.log('[APP] Navigation check:', { isAuthenticated, segments: segments[0], isReady, loaded });
    
    const inAuthGroup = segments[0] === '(tabs)';
    
    if (!isAuthenticated && inAuthGroup) {
      console.log('[APP] Redirecting to login (not authenticated)');
      router.replace('/login');
    } else if (isAuthenticated && !inAuthGroup && segments[0] !== 'modal' && segments[0] !== 'privacy' && segments[0] !== 'help') {
      console.log('[APP] Redirecting to home (authenticated)');
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments, isReady, loaded, router]);

  if (!loaded || !isReady) {
    return null;
  }

  return (
    <trpc.Provider client={trpcReactClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <View style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle="light-content" backgroundColor={theme.background} />
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
            </Stack>
          </View>
        </ErrorBoundary>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});