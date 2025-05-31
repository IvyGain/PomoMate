import { apiRequest, withRetry } from './apiClient';
import { ENDPOINTS } from '../config/api';

class SessionService {
  // Create a new session
  async createSession(data) {
    try {
      const response = await withRetry(() => 
        apiRequest.post(ENDPOINTS.sessions.create, {
          type: data.type,
          duration: data.duration,
          teamSessionId: data.teamSessionId,
        })
      );
      
      return response.data;
    } catch (error) {
      throw this.handleSessionError(error);
    }
  }
  
  // Get user's sessions
  async getUserSessions(params = {}) {
    try {
      const response = await apiRequest.get(ENDPOINTS.sessions.list, {
        params: {
          limit: params.limit || 20,
          offset: params.offset || 0,
        },
      });
      
      return response.data;
    } catch (error) {
      throw this.handleSessionError(error);
    }
  }
  
  // Get session statistics
  async getSessionStats(period = 'week') {
    try {
      const response = await apiRequest.get(ENDPOINTS.sessions.stats, {
        params: { period },
      });
      
      return response.data;
    } catch (error) {
      throw this.handleSessionError(error);
    }
  }
  
  // Team session methods
  async createTeamSession(data) {
    try {
      const response = await apiRequest.post(ENDPOINTS.sessions.team.create, {
        name: data.name,
        focusDuration: data.focusDuration,
        breakDuration: data.breakDuration,
      });
      
      return response.data.teamSession;
    } catch (error) {
      throw this.handleSessionError(error);
    }
  }
  
  async getTeamSession(sessionId) {
    try {
      const response = await apiRequest.get(
        ENDPOINTS.sessions.team.get(sessionId)
      );
      
      return response.data.teamSession;
    } catch (error) {
      throw this.handleSessionError(error);
    }
  }
  
  async joinTeamSession(code) {
    try {
      const response = await apiRequest.put(
        ENDPOINTS.sessions.team.join('join'),
        { code: code.toUpperCase() }
      );
      
      return response.data.teamSession;
    } catch (error) {
      throw this.handleSessionError(error);
    }
  }
  
  async leaveTeamSession(sessionId) {
    try {
      const response = await apiRequest.put(
        ENDPOINTS.sessions.team.leave(sessionId)
      );
      
      return response.data;
    } catch (error) {
      throw this.handleSessionError(error);
    }
  }
  
  async updateTeamSessionStatus(sessionId, status, currentMode) {
    try {
      const response = await apiRequest.put(
        ENDPOINTS.sessions.team.status(sessionId),
        { status, currentMode }
      );
      
      return response.data.teamSession;
    } catch (error) {
      throw this.handleSessionError(error);
    }
  }
  
  async sendTeamMessage(sessionId, message) {
    try {
      const response = await apiRequest.post(
        ENDPOINTS.sessions.team.messages(sessionId),
        { message }
      );
      
      return response.data.data;
    } catch (error) {
      throw this.handleSessionError(error);
    }
  }
  
  async deleteTeamSession(sessionId) {
    try {
      const response = await apiRequest.delete(
        ENDPOINTS.sessions.team.delete(sessionId)
      );
      
      return response.data;
    } catch (error) {
      throw this.handleSessionError(error);
    }
  }
  
  // Error handling
  handleSessionError(error) {
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          return new Error(data.error || '無効なリクエストです');
        case 403:
          return new Error(data.error || 'アクセス権限がありません');
        case 404:
          return new Error(data.error || 'セッションが見つかりません');
        default:
          return new Error(data.error || 'セッション操作中にエラーが発生しました');
      }
    }
    
    return error;
  }
}

export default new SessionService();