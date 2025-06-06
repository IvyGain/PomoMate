// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Add global test environment setup
global.__DEV__ = true;

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