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

// 強制的に黒x紫テーマ（ダークテーマのみ）
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
  currentTheme: 'dark';  // 常にdark
  theme: ThemeColors;
  toggleTheme: () => void;  // 何もしない
  setTheme: (theme: 'light' | 'dark') => void;  // 何もしない
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  currentTheme: 'dark',
  theme: darkTheme,
  
  // 常にダークテーマを返す（何もしない）
  toggleTheme: () => {
    // 何もしない - 常にダークテーマ
  },
  
  // 常にダークテーマを返す（何もしない）  
  setTheme: (theme: 'light' | 'dark') => {
    // 何もしない - 常にダークテーマ
  },
}));