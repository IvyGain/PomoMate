import { logger } from './logger';
import { Alert } from 'react-native';

const errorLogger = logger.child('ErrorHandler');

export interface AppError extends Error {
  code?: string;
  status?: number;
  details?: any;
  userMessage?: string;
  isOperational?: boolean;
}

export class ErrorHandler {
  private static errorMessages: Record<string, string> = {
    // Authentication errors
    'auth/invalid-credentials': 'メールアドレスまたはパスワードが正しくありません',
    'auth/email-already-exists': 'このメールアドレスは既に登録されています',
    'auth/weak-password': 'パスワードは6文字以上で設定してください',
    'auth/user-not-found': 'ユーザーが見つかりません',
    'auth/email-not-confirmed': 'メールアドレスの確認が必要です',
    'auth/session-expired': 'セッションの有効期限が切れました。再度ログインしてください',
    
    // Network errors
    'network/timeout': 'ネットワークタイムアウトが発生しました',
    'network/no-connection': 'インターネット接続を確認してください',
    'network/server-error': 'サーバーエラーが発生しました',
    
    // Validation errors
    'validation/required-field': '必須項目を入力してください',
    'validation/invalid-email': '有効なメールアドレスを入力してください',
    'validation/passwords-not-match': 'パスワードが一致しません',
    
    // Session errors
    'session/already-active': '既にアクティブなセッションがあります',
    'session/not-found': 'セッションが見つかりません',
    'session/cannot-interrupt': 'このセッションは中断できません',
    
    // Team errors
    'team/not-found': 'チームが見つかりません',
    'team/already-member': '既にチームのメンバーです',
    'team/full': 'チームは満員です',
    'team/invalid-code': '無効なチームコードです',
    
    // Social errors
    'social/friend-request-exists': '既に友達リクエストを送信しています',
    'social/already-friends': '既に友達です',
    'social/cannot-friend-self': '自分自身に友達リクエストを送ることはできません',
    
    // Game errors
    'game/not-unlocked': 'このゲームはまだアンロックされていません',
    'game/insufficient-coins': 'コインが不足しています',
    
    // Default
    'unknown': 'エラーが発生しました。しばらくしてからもう一度お試しください',
  };

  static createError(
    message: string,
    code?: string,
    status?: number,
    details?: any
  ): AppError {
    const error = new Error(message) as AppError;
    error.code = code;
    error.status = status;
    error.details = details;
    error.userMessage = this.getUserMessage(code || 'unknown');
    error.isOperational = true;
    return error;
  }

  static handle(error: any, context?: string): AppError {
    const appError = this.normalizeError(error);
    
    // Log the error
    errorLogger.error('Error occurred', {
      context,
      message: appError.message,
      code: appError.code,
      status: appError.status,
      stack: appError.stack,
      details: appError.details,
    });

    // Track error metrics if needed
    this.trackError(appError, context);

    return appError;
  }

  static handleAndAlert(error: any, context?: string): void {
    const appError = this.handle(error, context);
    
    // Show user-friendly alert
    Alert.alert(
      'エラー',
      appError.userMessage || appError.message,
      [{ text: 'OK', style: 'default' }],
      { cancelable: false }
    );
  }

  static handleSilently(error: any, context?: string): AppError {
    // Handle error without showing alert to user
    return this.handle(error, context);
  }

  private static normalizeError(error: any): AppError {
    // Already an AppError
    if (error.isOperational) {
      return error;
    }

    // Supabase error
    if (error.message && error.code) {
      return this.createError(
        error.message,
        this.mapSupabaseErrorCode(error.code),
        error.status,
        error.details
      );
    }

    // Axios error
    if (error.response) {
      const { status, data } = error.response;
      return this.createError(
        data?.message || data?.error || 'Network error',
        this.mapHttpStatusToCode(status),
        status,
        data?.details
      );
    }

    // Network error
    if (error.code === 'ECONNABORTED') {
      return this.createError(
        'Request timeout',
        'network/timeout',
        0
      );
    }

    if (error.message === 'Network Error') {
      return this.createError(
        'No internet connection',
        'network/no-connection',
        0
      );
    }

    // Default error
    return this.createError(
      error.message || 'Unknown error',
      'unknown',
      500,
      error
    );
  }

  private static mapSupabaseErrorCode(code: string): string {
    const codeMap: Record<string, string> = {
      '23505': 'auth/email-already-exists',
      'invalid_credentials': 'auth/invalid-credentials',
      'email_not_confirmed': 'auth/email-not-confirmed',
      'weak_password': 'auth/weak-password',
      'user_not_found': 'auth/user-not-found',
    };
    
    return codeMap[code] || code;
  }

  private static mapHttpStatusToCode(status: number): string {
    const statusMap: Record<number, string> = {
      400: 'validation/bad-request',
      401: 'auth/unauthorized',
      403: 'auth/forbidden',
      404: 'resource/not-found',
      409: 'resource/conflict',
      422: 'validation/unprocessable',
      429: 'rate-limit/exceeded',
      500: 'server/internal-error',
      502: 'server/bad-gateway',
      503: 'server/unavailable',
      504: 'server/timeout',
    };
    
    return statusMap[status] || 'unknown';
  }

  private static getUserMessage(code: string): string {
    // Check exact match first
    if (this.errorMessages[code]) {
      return this.errorMessages[code];
    }

    // Check prefix match (e.g., 'auth/*' errors)
    const prefix = code.split('/')[0];
    const prefixMessages: Record<string, string> = {
      'auth': '認証エラーが発生しました',
      'network': 'ネットワークエラーが発生しました',
      'validation': '入力内容を確認してください',
      'session': 'セッションエラーが発生しました',
      'team': 'チーム操作でエラーが発生しました',
      'social': 'ソーシャル機能でエラーが発生しました',
      'game': 'ゲームでエラーが発生しました',
      'server': 'サーバーエラーが発生しました',
      'rate-limit': 'リクエストが多すぎます。しばらくしてからお試しください',
    };

    return prefixMessages[prefix] || this.errorMessages.unknown;
  }

  private static trackError(error: AppError, context?: string): void {
    // Implement error tracking (e.g., Sentry, Analytics)
    // This is a placeholder for error tracking implementation
    if (__DEV__) {
      console.error(`[${context || 'Unknown'}] Error tracked:`, {
        message: error.message,
        code: error.code,
        userMessage: error.userMessage,
      });
    }
  }

  // Utility methods for common error scenarios
  static isAuthError(error: any): boolean {
    return error.code?.startsWith('auth/') || error.status === 401;
  }

  static isNetworkError(error: any): boolean {
    return error.code?.startsWith('network/') || !error.status;
  }

  static isValidationError(error: any): boolean {
    return error.code?.startsWith('validation/') || error.status === 422;
  }

  static isServerError(error: any): boolean {
    return error.status >= 500;
  }

  static shouldRetry(error: any): boolean {
    return this.isNetworkError(error) || this.isServerError(error);
  }
}

// Export convenience functions
export const handleError = (error: any, context?: string) => 
  ErrorHandler.handle(error, context);

export const handleErrorWithAlert = (error: any, context?: string) => 
  ErrorHandler.handleAndAlert(error, context);

export const handleErrorSilently = (error: any, context?: string) => 
  ErrorHandler.handleSilently(error, context);

export const createError = (
  message: string,
  code?: string,
  status?: number,
  details?: any
) => ErrorHandler.createError(message, code, status, details);