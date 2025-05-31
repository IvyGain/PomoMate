import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useTimerStore } from '../../../store/timerStore';
import { useUserStore } from '../../../store/userStore';
import offlineService from '../../services/offlineService';
import { sessionQueue } from '../../utils/offlineQueue';
import { useNetworkStore } from '../../utils/networkStatus';

// Mock offline service
jest.mock('../../services/offlineService');
jest.mock('../../utils/offlineQueue');

describe('Session Recording Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset stores
    useTimerStore.setState({
      isRunning: false,
      currentMode: 'focus',
      timeRemaining: 25 * 60,
      completedSessions: 0,
    });
    useUserStore.setState({
      sessions: 0,
      totalMinutes: 0,
      xp: 0,
      level: 1,
    });
  });

  describe('Online Session Recording', () => {
    beforeEach(() => {
      useNetworkStore.setState({
        isConnected: true,
        isInternetReachable: true,
      });
    });

    it('should record session when timer completes', async () => {
      const mockSessionResponse = {
        id: 'session-1',
        type: 'focus',
        duration: 25,
        xpEarned: 50,
        user: {
          level: 1,
          xp: 50,
          totalSessions: 1,
        },
      };

      offlineService.createSession.mockResolvedValueOnce(mockSessionResponse);

      const { result } = renderHook(() => ({
        timer: useTimerStore(),
        user: useUserStore(),
      }));

      // Complete a session
      await act(async () => {
        await result.current.timer.completeSession();
      });

      // Verify session was recorded
      expect(offlineService.createSession).toHaveBeenCalledWith({
        type: 'focus',
        duration: 25,
        teamSessionId: null,
      });

      // Verify user stats were updated
      await waitFor(() => {
        expect(result.current.user.sessions).toBe(1);
        expect(result.current.user.totalMinutes).toBe(25);
      });
    });

    it('should handle different session types correctly', async () => {
      const { result } = renderHook(() => useTimerStore());

      // Set to break mode
      act(() => {
        result.current.setMode('shortBreak');
      });

      await act(async () => {
        await result.current.completeSession();
      });

      // Verify break session was recorded
      expect(offlineService.createSession).toHaveBeenCalledWith({
        type: 'break',
        duration: 5,
        teamSessionId: null,
      });
    });

    it('should record team session with team ID', async () => {
      const teamSessionId = 'TEAM123';
      
      useTimerStore.setState({
        currentMode: 'focus',
        isTeamSession: true,
        currentTeamSessionId: teamSessionId,
      });

      const { result } = renderHook(() => useTimerStore());

      await act(async () => {
        await result.current.completeSession();
      });

      // Verify team session was recorded
      expect(offlineService.createSession).toHaveBeenCalledWith({
        type: 'focus',
        duration: 25,
        teamSessionId: teamSessionId,
      });
    });
  });

  describe('Offline Session Recording', () => {
    beforeEach(() => {
      useNetworkStore.setState({
        isConnected: false,
        isInternetReachable: false,
      });
    });

    it('should queue session when offline', async () => {
      const mockOfflineResponse = {
        id: 'queue-1',
        type: 'focus',
        duration: 25,
        offline: true,
      };

      offlineService.createSession.mockResolvedValueOnce(mockOfflineResponse);
      sessionQueue.addToQueue.mockResolvedValueOnce('queue-1');

      const { result } = renderHook(() => ({
        timer: useTimerStore(),
        user: useUserStore(),
      }));

      // Complete a session while offline
      await act(async () => {
        await result.current.timer.completeSession();
      });

      // Verify session was queued
      expect(offlineService.createSession).toHaveBeenCalled();
      
      // Verify local stats were still updated
      expect(result.current.user.sessions).toBe(1);
      expect(result.current.user.totalMinutes).toBe(25);
    });

    it('should sync queued sessions when coming online', async () => {
      // Mock queued sessions
      const queuedSessions = [
        { id: '1', type: 'focus', duration: 25 },
        { id: '2', type: 'break', duration: 5 },
      ];

      sessionQueue.queue = queuedSessions;
      sessionQueue.getQueueSize.mockReturnValue(2);

      // Simulate coming online
      await act(async () => {
        useNetworkStore.setState({
          isConnected: true,
          isInternetReachable: true,
        });
      });

      // Trigger sync
      await act(async () => {
        await offlineService.syncQueuedData();
      });

      // Verify sync was attempted
      expect(sessionQueue.processQueue).toHaveBeenCalled();
    });
  });

  describe('Session Streak Tracking', () => {
    it('should maintain streak for consecutive days', async () => {
      const { result } = renderHook(() => useUserStore());

      // Mock today's date
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      // Set last session as yesterday
      useUserStore.setState({
        lastSessionDate: yesterday,
        streak: 5,
      });

      // Complete a session today
      act(() => {
        result.current.addSession(25);
      });

      // Verify streak increased
      expect(result.current.streak).toBe(6);
      expect(result.current.lastSessionDate).toBe(today);
    });

    it('should reset streak after missing days', async () => {
      const { result } = renderHook(() => useUserStore());

      // Set last session as 3 days ago
      const threeDaysAgo = new Date(Date.now() - 259200000).toISOString().split('T')[0];
      
      useUserStore.setState({
        lastSessionDate: threeDaysAgo,
        streak: 10,
      });

      // Complete a session today
      act(() => {
        result.current.addSession(25);
      });

      // Verify streak was reset
      expect(result.current.streak).toBe(1);
    });
  });

  describe('XP and Level Progression', () => {
    it('should award XP for completed sessions', async () => {
      const { result } = renderHook(() => useUserStore());

      // Complete a 25-minute focus session
      act(() => {
        result.current.addSession(25);
      });

      // Verify XP was awarded
      expect(result.current.xp).toBeGreaterThan(0);
    });

    it('should level up when XP threshold is reached', async () => {
      const { result } = renderHook(() => useUserStore());

      // Set XP close to level up
      useUserStore.setState({
        level: 1,
        xp: 90,
        xpToNextLevel: 100,
      });

      // Complete a session to trigger level up
      act(() => {
        result.current.addSession(25);
      });

      // Verify level up
      expect(result.current.level).toBe(2);
      expect(result.current.xp).toBeLessThan(100); // XP should reset
    });
  });

  describe('Error Handling', () => {
    it('should continue with local updates if API fails', async () => {
      // Mock API failure
      offlineService.createSession.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => ({
        timer: useTimerStore(),
        user: useUserStore(),
      }));

      // Complete a session
      await act(async () => {
        await result.current.timer.completeSession();
      });

      // Verify local stats were still updated despite API failure
      expect(result.current.user.sessions).toBe(1);
      expect(result.current.user.totalMinutes).toBe(25);
    });
  });
});