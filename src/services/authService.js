import { apiRequest } from './apiClient';
import { ENDPOINTS } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

class AuthService {
  // Register new user
  async register(data) {
    try {
      const response = await apiRequest.post(ENDPOINTS.auth.register, {
        email: data.email,
        password: data.password,
        displayName: data.displayName,
      });
      
      const { user, accessToken, refreshToken } = response.data;
      
      // Save tokens
      await this.saveTokens(accessToken, refreshToken);
      
      return { user, accessToken };
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }
  
  // Login user
  async login(email, password) {
    try {
      const response = await apiRequest.post(ENDPOINTS.auth.login, {
        email,
        password,
      });
      
      const { user, accessToken, refreshToken } = response.data;
      
      // Save tokens
      await this.saveTokens(accessToken, refreshToken);
      
      return { user, accessToken };
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }
  
  // Logout user
  async logout() {
    try {
      await apiRequest.post(ENDPOINTS.auth.logout);
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API error:', error);
    } finally {
      // Clear tokens
      await this.clearTokens();
    }
  }
  
  // Get current user
  async getCurrentUser() {
    try {
      const response = await apiRequest.get(ENDPOINTS.auth.me);
      return response.data.user;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }
  
  // Update user profile
  async updateProfile(data) {
    try {
      const response = await apiRequest.put(ENDPOINTS.auth.profile, data);
      return response.data.user;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }
  
  // Request password reset
  async requestPasswordReset(email) {
    try {
      const response = await apiRequest.post(ENDPOINTS.auth.resetPassword, { email });
      return response.data;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }
  
  // Check if user is authenticated
  async isAuthenticated() {
    const token = await AsyncStorage.getItem('accessToken');
    return !!token;
  }
  
  // Helper methods
  async saveTokens(accessToken, refreshToken) {
    await AsyncStorage.multiSet([
      ['accessToken', accessToken],
      ['refreshToken', refreshToken],
    ]);
  }
  
  async clearTokens() {
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
  }
  
  handleAuthError(error) {
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          return new Error(data.error || '入力内容を確認してください');
        case 401:
          return new Error('メールアドレスまたはパスワードが正しくありません');
        case 409:
          return new Error('このメールアドレスは既に登録されています');
        case 422:
          return new Error(data.details || 'バリデーションエラー');
        default:
          return new Error(data.error || 'エラーが発生しました');
      }
    }
    
    return error;
  }
}

export default new AuthService();