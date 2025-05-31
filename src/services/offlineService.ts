// Offline service for handling offline functionality with Supabase
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sessionService } from './supabaseService';

class OfflineService {
  private readonly OFFLINE_SESSIONS_KEY = 'offline_sessions';

  async createSession(sessionData: any) {
    try {
      // Try to create session online first
      const session = await sessionService.createSession(sessionData);
      return session;
    } catch (error) {
      // If offline, store session locally
      console.log('Storing session offline:', error);
      await this.storeOfflineSession(sessionData);
      return { ...sessionData, id: Date.now().toString(), offline: true };
    }
  }

  private async storeOfflineSession(sessionData: any) {
    try {
      const existingSessions = await this.getOfflineSessions();
      const newSession = {
        ...sessionData,
        id: Date.now().toString(),
        offline: true,
        timestamp: new Date().toISOString(),
      };
      
      await AsyncStorage.setItem(
        this.OFFLINE_SESSIONS_KEY,
        JSON.stringify([...existingSessions, newSession])
      );
    } catch (error) {
      console.error('Error storing offline session:', error);
    }
  }

  private async getOfflineSessions(): Promise<any[]> {
    try {
      const sessions = await AsyncStorage.getItem(this.OFFLINE_SESSIONS_KEY);
      return sessions ? JSON.parse(sessions) : [];
    } catch (error) {
      console.error('Error getting offline sessions:', error);
      return [];
    }
  }

  async syncOfflineSessions() {
    try {
      const offlineSessions = await this.getOfflineSessions();
      
      if (offlineSessions.length === 0) return;

      // Try to sync each offline session
      const successfulSyncs: string[] = [];
      
      for (const session of offlineSessions) {
        try {
          delete session.id; // Remove local ID
          delete session.offline;
          delete session.timestamp;
          
          await sessionService.createSession(session);
          successfulSyncs.push(session.id);
        } catch (error) {
          console.error('Failed to sync session:', error);
        }
      }

      // Remove successfully synced sessions
      if (successfulSyncs.length > 0) {
        const remainingSessions = offlineSessions.filter(
          session => !successfulSyncs.includes(session.id)
        );
        
        await AsyncStorage.setItem(
          this.OFFLINE_SESSIONS_KEY,
          JSON.stringify(remainingSessions)
        );
      }

      console.log(`Synced ${successfulSyncs.length} offline sessions`);
    } catch (error) {
      console.error('Error syncing offline sessions:', error);
    }
  }

  async clearOfflineSessions() {
    try {
      await AsyncStorage.removeItem(this.OFFLINE_SESSIONS_KEY);
    } catch (error) {
      console.error('Error clearing offline sessions:', error);
    }
  }

  async syncQueuedData() {
    await this.syncOfflineSessions();
  }
}

export default new OfflineService();