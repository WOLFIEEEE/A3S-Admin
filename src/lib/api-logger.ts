/**
 * API Logger Utility
 * Provides detailed logging for API routes in development
 */

type LogLevel = 'info' | 'error' | 'warn' | 'success';

interface RequestLog {
  method: string;
  url: string;
  params?: Record<string, string>;
  body?: unknown;
  headers?: Record<string, string>;
}

interface ResponseLog {
  status: number;
  data?: unknown;
  error?: unknown;
  duration: number;
}

class APILogger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private getTimestamp(): string {
    return new Date().toISOString();
  }

  private formatLog(level: LogLevel, message: string): string {
    const colors = {
      info: '\x1b[36m', // Cyan
      error: '\x1b[31m', // Red
      warn: '\x1b[33m', // Yellow
      success: '\x1b[32m' // Green
    };
    const reset = '\x1b[0m';
    const timestamp = this.getTimestamp();

    return `${colors[level]}[${timestamp}] [${level.toUpperCase()}]${reset} ${message}`;
  }

  /**
   * Log incoming API request
   */
  logRequest(endpoint: string, request: RequestLog): void {
    if (!this.isDevelopment) return;

    console.log('\n' + '='.repeat(80));
    console.log(this.formatLog('info', `📥 INCOMING REQUEST: ${endpoint}`));
    console.log('─'.repeat(80));
    console.log(`Method:     ${request.method}`);
    console.log(`URL:        ${request.url}`);

    if (request.params && Object.keys(request.params).length > 0) {
      console.log(`Params:     ${JSON.stringify(request.params, null, 2)}`);
    }

    if (request.body) {
      console.log(`Body:       ${JSON.stringify(request.body, null, 2)}`);
    }

    if (request.headers) {
      console.log(`Headers:    ${JSON.stringify(request.headers, null, 2)}`);
    }

    console.log('='.repeat(80));
  }

  /**
   * Log API response
   */
  logResponse(endpoint: string, response: ResponseLog): void {
    if (!this.isDevelopment) return;

    const isSuccess = response.status >= 200 && response.status < 300;
    const level: LogLevel = isSuccess ? 'success' : 'error';

    console.log('\n' + '='.repeat(80));
    console.log(this.formatLog(level, `📤 OUTGOING RESPONSE: ${endpoint}`));
    console.log('─'.repeat(80));
    console.log(
      `Status:     ${response.status} ${this.getStatusText(response.status)}`
    );
    console.log(`Duration:   ${response.duration}ms`);

    if (response.data) {
      const dataStr = JSON.stringify(response.data, null, 2);
      const truncated =
        dataStr.length > 500 ? dataStr.substring(0, 500) + '...' : dataStr;
      console.log(`Data:       ${truncated}`);
    }

    if (response.error) {
      console.log(`Error:      ${JSON.stringify(response.error, null, 2)}`);
    }

    console.log('='.repeat(80) + '\n');
  }

  /**
   * Log database query
   */
  logQuery(query: string, params?: unknown[]): void {
    if (!this.isDevelopment) return;

    console.log(this.formatLog('info', '🗄️  DATABASE QUERY'));
    console.log(`Query:      ${query}`);
    if (params && params.length > 0) {
      console.log(`Params:     ${JSON.stringify(params)}`);
    }
  }

  /**
   * Log error with stack trace
   */
  logError(endpoint: string, error: unknown): void {
    console.error('\n' + '!'.repeat(80));
    console.error(this.formatLog('error', `❌ ERROR in ${endpoint}`));
    console.error('!'.repeat(80));

    if (error instanceof Error) {
      console.error(`Message:    ${error.message}`);
      console.error(`Name:       ${error.name}`);
      if (error.stack) {
        console.error(`Stack:      ${error.stack}`);
      }
    } else {
      console.error(`Error:      ${JSON.stringify(error, null, 2)}`);
    }

    console.error('!'.repeat(80) + '\n');
  }

  /**
   * Log general info
   */
  info(message: string, data?: unknown): void {
    if (!this.isDevelopment) return;

    console.log(this.formatLog('info', message));
    if (data) {
      console.log(JSON.stringify(data, null, 2));
    }
  }

  /**
   * Log warning
   */
  warn(message: string, data?: unknown): void {
    console.warn(this.formatLog('warn', message));
    if (data) {
      console.warn(JSON.stringify(data, null, 2));
    }
  }

  /**
   * Get HTTP status text
   */
  private getStatusText(status: number): string {
    const statusTexts: Record<number, string> = {
      200: 'OK',
      201: 'Created',
      204: 'No Content',
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      500: 'Internal Server Error',
      502: 'Bad Gateway',
      503: 'Service Unavailable'
    };
    return statusTexts[status] || '';
  }

  /**
   * Create a timer for measuring request duration
   */
  startTimer(): () => number {
    const start = Date.now();
    return () => Date.now() - start;
  }
}

export const apiLogger = new APILogger();
