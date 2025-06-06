import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define theme types
export type ThemeType = 'light' | 'dark';

// Define theme colors
export interface ThemeColors {
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  inactive: string;
  border: string; // Added border property
}

// Define dark theme colors
const darkTheme: ThemeColors = {
  background: '#121212',
  card: '#1E1E1E',
  text: '#FFFFFF',
  textSecondary: '#AAAAAA',
  primary: '#6200EE',
  secondary: '#03DAC6',
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#EF476F',
  inactive: '#555555',
  border: 'rgba(255, 255, 255, 0.1)', // Added border color
};

// Define light theme colors
const lightTheme: ThemeColors = {
  background: '#FFFFFF',
  card: '#F5F5F5',
  text: '#121212',
  textSecondary: '#666666',
  primary: '#6200EE',
  secondary: '#03DAC6',
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#EF476F',
  inactive: '#CCCCCC',
  border: 'rgba(0, 0, 0, 0.1)', // Added border color
};

// Define theme store
interface ThemeState {
  themeType: ThemeType;
  theme: ThemeColors;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      themeType: 'dark',
      theme: darkTheme,
      toggleTheme: () => set((state) => {
        const newThemeType = state.themeType === 'dark' ? 'light' : 'dark';
        const newTheme = newThemeType === 'dark' ? darkTheme : lightTheme;
        return { themeType: newThemeType, theme: newTheme };
      }),
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);