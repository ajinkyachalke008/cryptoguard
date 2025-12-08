/**
 * Logger Utility
 * 
 * Simple logging wrapper that provides consistent logging across the application.
 * Can be easily extended to use advanced loggers like Winston or Pino.
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
}

class Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  private formatLog(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(data && { data }),
    };
  }

  /**
   * Log informational messages
   */
  info(message: string, data?: any): void {
    const log = this.formatLog('info', message, data);
    console.log(`[INFO] ${log.timestamp} - ${message}`, data || '');
  }

  /**
   * Log warning messages
   */
  warn(message: string, data?: any): void {
    const log = this.formatLog('warn', message, data);
    console.warn(`[WARN] ${log.timestamp} - ${message}`, data || '');
  }

  /**
   * Log error messages
   */
  error(message: string, error?: any): void {
    const log = this.formatLog('error', message, error);
    console.error(`[ERROR] ${log.timestamp} - ${message}`, error || '');
  }

  /**
   * Log debug messages (only in development)
   */
  debug(message: string, data?: any): void {
    if (this.isDevelopment) {
      const log = this.formatLog('debug', message, data);
      console.debug(`[DEBUG] ${log.timestamp} - ${message}`, data || '');
    }
  }

  /**
   * Log HTTP requests
   */
  http(method: string, url: string, statusCode?: number, duration?: number): void {
    const message = `${method} ${url}${statusCode ? ` - ${statusCode}` : ''}${duration ? ` (${duration}ms)` : ''}`;
    this.info(message);
  }
}

// Export singleton instance
export const logger = new Logger();
