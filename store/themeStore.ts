import { create } from 'zustand';

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
  border: string;
  overlay: string;
}

const lightTheme: ThemeColors = {
  background: '#0A0A0F',
  card: '#1A1A2E',
  text: '#FFFFFF',
  textSecondary: '#AAAAAA',
  primary: '#8B5CF6',
  secondary: '#A855F7',
  success: '#6BCB77',
  warning: '#FFD166',
  error: '#EF476F',
  inactive: '#555555',
  border: '#333333',
  overlay: 'rgba(0, 0, 0, 0.7)',
};

const darkTheme: ThemeColors = {
  background: '#0A0A0F',
  card: '#1A1A2E',
  text: '#FFFFFF',
  textSecondary: '#AAAAAA',
  primary: '#8B5CF6',
  secondary: '#A855F7',
  success: '#6BCB77',
  warning: '#FFD166',
  error: '#EF476F',
  inactive: '#555555',
  border: '#333333',
  overlay: 'rgba(0, 0, 0, 0.7)',
};

interface ThemeState {
  currentTheme: 'light' | 'dark';
  theme: ThemeColors;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  currentTheme: 'dark',
  theme: darkTheme,
  
  toggleTheme: () => {
    const newTheme = get().currentTheme === 'light' ? 'dark' : 'light';
    set({
      currentTheme: newTheme,
      theme: newTheme === 'light' ? lightTheme : darkTheme,
    });
  },
  
  setTheme: (theme: 'light' | 'dark') => {
    set({
      currentTheme: theme,
      theme: theme === 'light' ? lightTheme : darkTheme,
    });
  },
}));