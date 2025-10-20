import { trpcClient } from '@/lib/trpc';
import { useTimerStore, TeamSession } from '@/store/timerStore';

class TeamSessionSyncService {
  private syncInterval: ReturnType<typeof setInterval> | null = null;
  private readonly SYNC_INTERVAL_MS = 3000;
  private isPolling = false;

  startPolling() {
    if (this.isPolling) {
      console.log('[TEAM_SESSION_SYNC] Already polling');
      return;
    }

    console.log('[TEAM_SESSION_SYNC] Starting polling');
    this.isPolling = true;

    this.syncInterval = setInterval(() => {
      this.syncTeamSessions();
    }, this.SYNC_INTERVAL_MS);

    this.syncTeamSessions();
  }

  stopPolling() {
    if (this.syncInterval) {
      console.log('[TEAM_SESSION_SYNC] Stopping polling');
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    this.isPolling = false;
  }

  private async syncTeamSessions() {
    try {
      const { currentTeamSessionId, isTeamSession } = useTimerStore.getState();

      if (!isTeamSession || !currentTeamSessionId) {
        return;
      }

      const response = await trpcClient.teamSessions.getSessions.query();

      if (response.sessions && response.sessions.length > 0) {
        const typedSessions = response.sessions as unknown as TeamSession[];
        const currentSession = typedSessions.find(
          (s) => s.id === currentTeamSessionId
        );

        if (currentSession) {
          useTimerStore.setState({
            teamSessions: typedSessions,
            currentMode: currentSession.currentMode,
            timeRemaining: currentSession.timeRemaining,
            isRunning: currentSession.isRunning,
          });

          console.log('[TEAM_SESSION_SYNC] Synced team session:', currentTeamSessionId);
        }
      }
    } catch (error) {
      console.error('[TEAM_SESSION_SYNC] Failed to sync team sessions:', error);
    }
  }

  async createSession(name: string, hostId: string, hostName: string, hostAvatar: string) {
    try {
      const response = await trpcClient.teamSessions.createSession.mutate({
        name,
        hostId,
        hostName,
        hostAvatar,
      });

      if (response.success && response.sessionId) {
        console.log('[TEAM_SESSION_SYNC] Created team session:', response.sessionId);
        return response.sessionId;
      }

      return null;
    } catch (error) {
      console.error('[TEAM_SESSION_SYNC] Failed to create team session:', error);
      return null;
    }
  }

  async joinSession(sessionId: string, userId: string, userName: string, userAvatar: string) {
    try {
      const response = await trpcClient.teamSessions.joinSession.mutate({
        sessionId,
        userId,
        userName,
        userAvatar,
      });

      if (response.success) {
        console.log('[TEAM_SESSION_SYNC] Joined team session:', sessionId);
        return true;
      }

      return false;
    } catch (error) {
      console.error('[TEAM_SESSION_SYNC] Failed to join team session:', error);
      return false;
    }
  }

  async leaveSession(sessionId: string, userId: string) {
    try {
      const response = await trpcClient.teamSessions.leaveSession.mutate({
        sessionId,
        userId,
      });

      if (response.success) {
        console.log('[TEAM_SESSION_SYNC] Left team session:', sessionId);
        return true;
      }

      return false;
    } catch (error) {
      console.error('[TEAM_SESSION_SYNC] Failed to leave team session:', error);
      return false;
    }
  }
}

export const teamSessionSyncService = new TeamSessionSyncService();
