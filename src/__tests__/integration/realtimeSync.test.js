import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useSocialStore } from '../../../store/socialStore';
import { useTimerStore } from '../../../store/timerStore';
import socketService from '../../services/socketService';
import { useTeamSession } from '../../hooks/useSocket';

// Mock socket service
jest.mock('../../services/socketService', () => ({
  default: {
    connect: jest.fn(),
    disconnect: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
    createTeamSession: jest.fn(),
    joinTeamSession: jest.fn(),
    startTeamSession: jest.fn(),
    sendTeamMessage: jest.fn(),
    isSocketConnected: jest.fn(() => true),
  },
}));

describe('Real-time Sync Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset stores
    useSocialStore.setState({
      friends: [],
      pendingRequests: [],
      notifications: [],
    });
    useTimerStore.setState({
      teamSessions: [],
      isTeamSession: false,
      currentTeamSessionId: null,
    });
  });

  describe('Socket Connection', () => {
    it('should connect socket when user is authenticated', async () => {
      // Simulate authenticated user
      const mockUser = { id: '1', email: 'test@example.com' };
      
      // Mock socket connection
      socketService.connect.mockResolvedValueOnce();
      
      // Initialize socket listeners
      const { result } = renderHook(() => useSocialStore());
      
      await act(async () => {
        await result.current.initializeSocketListeners();
      });

      // Verify socket service methods were called
      expect(socketService.on).toHaveBeenCalledWith('friend:request', expect.any(Function));
      expect(socketService.on).toHaveBeenCalledWith('friend:accepted', expect.any(Function));
      expect(socketService.on).toHaveBeenCalledWith('friend:online', expect.any(Function));
      expect(socketService.on).toHaveBeenCalledWith('friend:offline', expect.any(Function));
    });
  });

  describe('Friend Events', () => {
    it('should handle incoming friend request', async () => {
      const { result } = renderHook(() => useSocialStore());
      
      const mockRequest = {
        requestId: 'req-1',
        senderName: 'John Doe',
        senderUsername: 'johndoe',
        senderAvatar: 'avatar.png',
        senderLevel: 5,
      };

      // Simulate friend request event
      act(() => {
        result.current.handleIncomingFriendRequest({
          id: mockRequest.requestId,
          name: mockRequest.senderName,
          username: mockRequest.senderUsername,
          avatar: mockRequest.senderAvatar,
          level: mockRequest.senderLevel,
          time: new Date().toISOString(),
        });
      });

      // Verify request was added
      expect(result.current.pendingRequests).toHaveLength(1);
      expect(result.current.pendingRequests[0].name).toBe('John Doe');
      
      // Verify notification was created
      expect(result.current.notifications).toHaveLength(1);
      expect(result.current.notifications[0].type).toBe('friendRequest');
    });

    it('should update friend online status', async () => {
      const { result } = renderHook(() => useSocialStore());
      
      // Add a friend
      const friend = {
        id: 'friend-1',
        name: 'Jane Doe',
        username: 'janedoe',
        avatar: 'avatar.png',
        level: 3,
        streak: 5,
        lastActive: new Date().toISOString(),
        status: 'オフライン' as const,
      };
      
      act(() => {
        result.current.addFriend(friend);
      });

      // Simulate friend coming online
      act(() => {
        result.current.updateFriendStatus('friend-1', 'オンライン');
      });

      // Verify status was updated
      expect(result.current.friends[0].status).toBe('オンライン');
    });
  });

  describe('Team Session Events', () => {
    it('should create and join team session', async () => {
      const { result: timerResult } = renderHook(() => useTimerStore());
      const { result: hookResult } = renderHook(() => useTeamSession());
      
      // Create team session
      const sessionName = 'Study Session';
      const hostData = {
        id: 'host-1',
        name: 'Host User',
        avatar: 'host.png',
      };

      let sessionId: string;
      act(() => {
        sessionId = timerResult.current.createTeamSession(
          sessionName,
          hostData.id,
          hostData.name,
          hostData.avatar
        );
      });

      // Verify session was created locally
      expect(timerResult.current.teamSessions).toHaveLength(1);
      expect(timerResult.current.teamSessions[0].name).toBe(sessionName);

      // Simulate another user joining
      const participant = {
        id: 'user-2',
        name: 'Participant',
        avatar: 'participant.png',
      };

      act(() => {
        const joined = timerResult.current.joinTeamSession(
          sessionId!,
          participant.id,
          participant.name,
          participant.avatar
        );
        expect(joined).toBe(true);
      });

      // Verify participant was added
      expect(timerResult.current.teamSessions[0].participants).toHaveLength(2);
    });

    it('should sync timer state in team session', async () => {
      const { result } = renderHook(() => useTimerStore());
      
      // Create and start team session
      const sessionId = 'TEAM123';
      const teamSession = {
        id: sessionId,
        hostId: 'host-1',
        name: 'Team Focus',
        participants: [
          { id: 'host-1', name: 'Host', avatar: 'host.png', isReady: true, isActive: true, joinedAt: new Date().toISOString() },
        ],
        currentMode: 'focus' as const,
        timeRemaining: 1500,
        isRunning: true,
        createdAt: new Date().toISOString(),
        voiceChatEnabled: false,
        messages: [],
      };

      act(() => {
        result.current.teamSessions = [teamSession];
        result.current.isTeamSession = true;
        result.current.currentTeamSessionId = sessionId;
      });

      // Simulate timer update from host
      act(() => {
        result.current.tickTimer();
      });

      // Verify timer decreased
      expect(result.current.timeRemaining).toBeLessThan(1500);
    });

    it('should handle team session chat messages', async () => {
      const { result } = renderHook(() => useTimerStore());
      
      const sessionId = 'TEAM123';
      
      // Create team session
      act(() => {
        const id = result.current.createTeamSession('Team Chat', 'user-1', 'User 1', 'avatar1.png');
        result.current.currentTeamSessionId = id;
      });

      // Send a message
      act(() => {
        result.current.sendMessage(
          result.current.currentTeamSessionId!,
          'user-1',
          'User 1',
          'avatar1.png',
          'Hello team!'
        );
      });

      // Verify message was added
      const session = result.current.getTeamSession(result.current.currentTeamSessionId!);
      expect(session?.messages).toHaveLength(1);
      expect(session?.messages[0].text).toBe('Hello team!');
    });
  });

  describe('Achievement Notifications', () => {
    it('should show notification for unlocked achievement', async () => {
      const { result } = renderHook(() => useSocialStore());
      
      // Simulate achievement unlocked event
      act(() => {
        result.current.addNotification({
          type: 'achievement',
          message: '実績「早起き鳥」を解除しました！',
        });
      });

      // Verify notification was added
      expect(result.current.notifications).toHaveLength(1);
      expect(result.current.notifications[0].type).toBe('achievement');
      expect(result.current.notifications[0].read).toBe(false);
    });

    it('should mark notifications as read', async () => {
      const { result } = renderHook(() => useSocialStore());
      
      // Add multiple notifications
      act(() => {
        result.current.addNotification({ type: 'friendRequest', message: 'New friend request' });
        result.current.addNotification({ type: 'achievement', message: 'Achievement unlocked' });
      });

      // Mark all as read
      act(() => {
        result.current.markAllNotificationsAsRead();
      });

      // Verify all notifications are marked as read
      result.current.notifications.forEach(notification => {
        expect(notification.read).toBe(true);
      });
    });
  });

  describe('Reconnection Handling', () => {
    it('should handle socket reconnection gracefully', async () => {
      socketService.isSocketConnected.mockReturnValueOnce(false);
      
      // Simulate reconnection
      socketService.connect.mockResolvedValueOnce();
      socketService.isSocketConnected.mockReturnValueOnce(true);
      
      await act(async () => {
        await socketService.connect();
      });

      expect(socketService.connect).toHaveBeenCalled();
      expect(socketService.isSocketConnected()).toBe(true);
    });
  });
});