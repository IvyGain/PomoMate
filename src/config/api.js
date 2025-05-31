// API Configuration
// Development環境では環境変数からAPIのURLを取得（Expo Go対応）
export const API_BASE_URL = __DEV__ 
  ? (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api')
  : (process.env.EXPO_PUBLIC_API_URL || 'https://api.pomodoroplay.app/api');

export const SOCKET_URL = __DEV__
  ? (process.env.EXPO_PUBLIC_WS_URL || 'http://localhost:3000')
  : (process.env.EXPO_PUBLIC_SOCKET_URL || 'https://api.pomodoroplay.app');

// API Endpoints
export const ENDPOINTS = {
  // Auth
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    me: '/auth/me',
    profile: '/auth/profile',
    resetPassword: '/auth/reset-password',
  },
  
  // Sessions
  sessions: {
    create: '/sessions',
    list: '/sessions',
    stats: '/sessions/stats',
    team: {
      create: '/sessions/team',
      get: (id) => `/sessions/team/${id}`,
      join: (id) => `/sessions/team/${id}/join`,
      leave: (id) => `/sessions/team/${id}/leave`,
      status: (id) => `/sessions/team/${id}/status`,
      messages: (id) => `/sessions/team/${id}/messages`,
      delete: (id) => `/sessions/team/${id}`,
    },
  },
  
  // Users
  users: {
    stats: (userId) => `/users/${userId}/stats`,
    achievements: (userId) => `/users/${userId}/achievements`,
    activeDays: (userId) => `/users/${userId}/active-days`,
    character: (userId) => `/users/${userId}/character`,
    leaderboard: '/users/leaderboard',
  },
  
  // Social
  social: {
    friends: '/social/friends',
    friendRequest: '/social/friends/request',
    acceptRequest: (requestId) => `/social/friends/request/${requestId}/accept`,
    rejectRequest: (requestId) => `/social/friends/request/${requestId}/reject`,
    removeFriend: (friendId) => `/social/friends/${friendId}`,
    notifications: '/social/notifications',
    markNotificationRead: (notificationId) => `/social/notifications/${notificationId}/read`,
    markAllNotificationsRead: '/social/notifications/read-all',
  },
  
  // Games
  games: {
    list: '/games',
    scores: (gameId) => `/games/${gameId}/scores`,
    submitScore: (gameId) => `/games/${gameId}/scores`,
    unlock: (gameId) => `/games/${gameId}/unlock`,
  },
  
  // Settings
  settings: {
    get: '/settings',
    update: '/settings',
  },
};

// Request timeout
export const REQUEST_TIMEOUT = 10000; // 10 seconds

// Retry configuration
export const RETRY_CONFIG = {
  retries: 3,
  retryDelay: 1000,
  retryCondition: (error) => {
    return error.code === 'ECONNABORTED' || 
           error.response?.status >= 500 ||
           !error.response;
  },
};