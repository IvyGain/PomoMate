type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: Date;
  context?: string;
}

class Logger {
  private isDevelopment: boolean;
  private logLevel: LogLevel;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.logLevel = (process.env.EXPO_PUBLIC_LOG_LEVEL as LogLevel) || 'info';
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.isDevelopment && level === 'debug') return false;
    
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    
    return messageLevelIndex >= currentLevelIndex;
  }

  private formatMessage(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString();
    const context = entry.context ? `[${entry.context}]` : '';
    return `${timestamp} [${entry.level.toUpperCase()}]${context} ${entry.message}`;
  }

  private log(level: LogLevel, message: string, data?: any, context?: string) {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      data,
      timestamp: new Date(),
      context
    };

    const formattedMessage = this.formatMessage(entry);

    switch (level) {
      case 'debug':
        console.log(formattedMessage, data || '');
        break;
      case 'info':
        console.info(formattedMessage, data || '');
        break;
      case 'warn':
        console.warn(formattedMessage, data || '');
        break;
      case 'error':
        console.error(formattedMessage, data || '');
        break;
    }

    // In production, could send to external logging service
    if (!this.isDevelopment && level === 'error') {
      // TODO: Send to Sentry, LogRocket, etc.
    }
  }

  debug(message: string, data?: any, context?: string) {
    this.log('debug', message, data, context);
  }

  info(message: string, data?: any, context?: string) {
    this.log('info', message, data, context);
  }

  warn(message: string, data?: any, context?: string) {
    this.log('warn', message, data, context);
  }

  error(message: string, data?: any, context?: string) {
    this.log('error', message, data, context);
  }

  // Create a child logger with a specific context
  child(context: string) {
    const childLogger = Object.create(this);
    const originalLog = this.log.bind(this);
    
    childLogger.log = (level: LogLevel, message: string, data?: any, ctx?: string) => {
      originalLog(level, message, data, ctx || context);
    };
    
    return childLogger;
  }
}

// Export singleton instance
export const logger = new Logger();

// Export for testing
export { Logger };