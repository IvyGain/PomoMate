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
  background: '#FFFFFF',
  card: '#F8F9FA',
  text: '#333333',
  textSecondary: '#666666',
  primary: '#007AFF',
  secondary: '#5856D6',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  inactive: '#C7C7CC',
  border: '#E5E5EA',
  overlay: 'rgba(0, 0, 0, 0.4)',
};

const darkTheme: ThemeColors = {
  background: '#000000',
  card: '#1C1C1E',
  text: '#FFFFFF',
  textSecondary: '#99999A',
  primary: '#0A84FF',
  secondary: '#5E5CE6',
  success: '#30D158',
  warning: '#FF9F0A',
  error: '#FF453A',
  inactive: '#48484A',
  border: '#38383A',
  overlay: 'rgba(0, 0, 0, 0.7)',
};

interface ThemeState {
  currentTheme: 'light' | 'dark';
  theme: ThemeColors;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  currentTheme: 'light',
  theme: lightTheme,
  
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