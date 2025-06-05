import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useAuthStore } from '../../../store/authStore';
import { useUserStore } from '../../../store/userStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../../services/apiClient';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  multiGet: jest.fn(),
  multiSet: jest.fn(),
  multiRemove: jest.fn(),
}));

// Mock API client
jest.mock('../../services/apiClient');

describe('Auth Flow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset stores
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
    useUserStore.setState({
      level: 1,
      xp: 0,
      sessions: 0,
      streak: 0,
      totalMinutes: 0,
      unlockedAchievements: [],
    });
  });

  describe('Login Flow', () => {
    it('should successfully login and load user data', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      };
      
      const mockTokens = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      };

      // Mock successful login response
      apiClient.post.mockResolvedValueOnce({
        data: {
          user: mockUser,
          ...mockTokens,
        },
      });

      // Mock user stats response
      apiClient.get.mockResolvedValueOnce({
        data: {
          level: 5,
          xp: 250,
          totalSessions: 42,
          currentStreak: 7,
          totalMinutes: 630,
        },
      });

      const { result } = renderHook(() => ({
        auth: useAuthStore(),
        user: useUserStore(),
      }));

      // Perform login
      await act(async () => {
        await result.current.auth.login('test@example.com', 'password123');
      });

      // Verify auth state
      expect(result.current.auth.isAuthenticated).toBe(true);
      expect(result.current.auth.user).toEqual(mockUser);
      expect(result.current.auth.error).toBeNull();

      // Verify tokens were stored
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('accessToken', mockTokens.accessToken);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('refreshToken', mockTokens.refreshToken);

      // Verify user data was loaded
      await waitFor(() => {
        expect(result.current.user.level).toBe(5);
        expect(result.current.user.xp).toBe(250);
        expect(result.current.user.sessions).toBe(42);
        expect(result.current.user.streak).toBe(7);
        expect(result.current.user.totalMinutes).toBe(630);
      });
    });

    it('should handle login errors', async () => {
      // Mock failed login response
      apiClient.post.mockRejectedValueOnce({
        response: {
          status: 401,
          data: {
            error: 'Invalid credentials',
          },
        },
      });

      const { result } = renderHook(() => useAuthStore());

      // Perform login
      await act(async () => {
        await result.current.login('test@example.com', 'wrongpassword');
      });

      // Verify error state
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.error).toBe('Invalid credentials');
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('Token Refresh Flow', () => {
    it('should refresh token when expired', async () => {
      const newTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      // Mock stored refresh token
      AsyncStorage.getItem.mockResolvedValueOnce('old-refresh-token');

      // Mock refresh token response
      apiClient.post.mockResolvedValueOnce({
        data: newTokens,
      });

      // Mock retry of original request
      apiClient.get.mockResolvedValueOnce({
        data: { success: true },
      });

      // Simulate 401 error
      const error = {
        response: { status: 401 },
        config: {
          url: '/api/user/profile',
          method: 'get',
          headers: {},
        },
      };

      // Import the response interceptor
      const interceptor = apiClient.interceptors.response.handlers[0].rejected;
      
      // Call the interceptor
      const result = await interceptor(error);

      // Verify token refresh was called
      expect(apiClient.post).toHaveBeenCalledWith(
        expect.stringContaining('/auth/refresh'),
        { refreshToken: 'old-refresh-token' },
      );

      // Verify new tokens were stored
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('accessToken', newTokens.accessToken);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('refreshToken', newTokens.refreshToken);
    });
  });

  describe('Logout Flow', () => {
    it('should clear all data on logout', async () => {
      // Set initial authenticated state
      useAuthStore.setState({
        user: { id: '1', email: 'test@example.com' },
        isAuthenticated: true,
      });
      
      useUserStore.setState({
        level: 5,
        xp: 250,
        sessions: 42,
      });

      // Mock successful logout
      apiClient.post.mockResolvedValueOnce({ data: { success: true } });

      const { result } = renderHook(() => ({
        auth: useAuthStore(),
        user: useUserStore(),
      }));

      // Perform logout
      await act(async () => {
        await result.current.auth.logout();
      });

      // Verify auth state is cleared
      expect(result.current.auth.isAuthenticated).toBe(false);
      expect(result.current.auth.user).toBeNull();

      // Verify tokens were removed
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('accessToken');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('refreshToken');

      // Verify user data was reset
      expect(result.current.user.level).toBe(1);
      expect(result.current.user.xp).toBe(0);
      expect(result.current.user.sessions).toBe(0);
    });
  });

  describe('Auto Login on App Start', () => {
    it('should auto login if valid token exists', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      };

      // Mock stored token
      AsyncStorage.getItem.mockResolvedValueOnce('valid-access-token');

      // Mock profile check response
      apiClient.get.mockResolvedValueOnce({
        data: mockUser,
      });

      const { result } = renderHook(() => useAuthStore());

      // Check auth status
      await act(async () => {
        await result.current.checkAuthStatus();
      });

      // Verify user is authenticated
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUser);
    });

    it('should not auto login if no token exists', async () => {
      // Mock no stored token
      AsyncStorage.getItem.mockResolvedValueOnce(null);

      const { result } = renderHook(() => useAuthStore());

      // Check auth status
      await act(async () => {
        await result.current.checkAuthStatus();
      });

      // Verify user is not authenticated
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(apiClient.get).not.toHaveBeenCalled();
    });
  });
});