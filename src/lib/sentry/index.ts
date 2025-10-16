/**
 * Centralized Sentry Error Tracking
 *
 * This module provides a unified interface for error tracking and monitoring
 * across the entire application using Sentry.
 */

import * as Sentry from '@sentry/nextjs';
import type { User } from '@clerk/nextjs/server';

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  FATAL = 'fatal',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
  DEBUG = 'debug'
}

/**
 * Error context interface
 */
export interface ErrorContext {
  userId?: string;
  userEmail?: string;
  userName?: string;
  component?: string;
  action?: string;
  projectId?: string;
  clientId?: string;
  reportId?: string;
  additional?: Record<string, any>;
}

/**
 * Initialize Sentry with user context
 */
export function initializeSentry() {
  if (process.env.NEXT_PUBLIC_SENTRY_DISABLED === 'true') {
    return;
  }

  // Already initialized in instrumentation files
  // This is just for additional runtime configuration
  return Sentry;
}

/**
 * Set user context for error tracking
 */
export function setUserContext(
  user: {
    id: string;
    email?: string;
    name?: string;
    username?: string;
  } | null
) {
  if (!user) {
    Sentry.setUser(null);
    return;
  }

  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username || user.name
  });
}

/**
 * Set Clerk user context
 */
export function setClerkUserContext(user: User | null) {
  if (!user) {
    Sentry.setUser(null);
    return;
  }

  Sentry.setUser({
    id: user.id,
    email: user.emailAddresses[0]?.emailAddress,
    username: user.username || `${user.firstName} ${user.lastName}`.trim()
  });
}

/**
 * Add breadcrumb for tracking user actions
 */
export function addBreadcrumb(
  message: string,
  data?: Record<string, any>,
  category = 'action'
) {
  Sentry.addBreadcrumb({
    message,
    category,
    level: 'info',
    data
  });
}

/**
 * Capture exception with context
 */
export function captureException(
  error: Error | unknown,
  context?: ErrorContext,
  severity: ErrorSeverity = ErrorSeverity.ERROR
) {
  if (process.env.NEXT_PUBLIC_SENTRY_DISABLED === 'true') {
    return null;
  }

  // Set context
  if (context) {
    Sentry.setContext('error_context', {
      component: context.component,
      action: context.action,
      projectId: context.projectId,
      clientId: context.clientId,
      reportId: context.reportId,
      ...context.additional
    });

    // Set tags for filtering
    if (context.component) Sentry.setTag('component', context.component);
    if (context.action) Sentry.setTag('action', context.action);
    if (context.projectId) Sentry.setTag('project_id', context.projectId);
  }

  // Capture the exception
  const eventId = Sentry.captureException(error, {
    level: severity
  });

  // Add breadcrumb for this error
  addBreadcrumb(
    `Error captured: ${error instanceof Error ? error.message : String(error)}`,
    context,
    'error'
  );

  return eventId;
}

/**
 * Capture message (non-error logging)
 */
export function captureMessage(
  message: string,
  context?: ErrorContext,
  severity: ErrorSeverity = ErrorSeverity.INFO
) {
  if (process.env.NEXT_PUBLIC_SENTRY_DISABLED === 'true') {
    return null;
  }

  if (context) {
    Sentry.setContext('message_context', context as Record<string, unknown>);
  }

  return Sentry.captureMessage(message, {
    level: severity
  });
}

/**
 * Start a span for performance monitoring
 * @deprecated Use Sentry.startSpan() directly instead
 */
export function startTransaction(name: string, op: string) {
  if (process.env.NEXT_PUBLIC_SENTRY_DISABLED === 'true') {
    return null;
  }

  // Use the new span API instead of deprecated startTransaction
  return Sentry.startSpan(
    {
      name,
      op
    },
    (span) => span
  );
}

/**
 * Wrap async function with error tracking
 */
export function withErrorTracking<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context: ErrorContext
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      captureException(error, context);
      throw error;
    }
  }) as T;
}

/**
 * Wrap sync function with error tracking
 */
export function withErrorTrackingSync<T extends (...args: any[]) => any>(
  fn: T,
  context: ErrorContext
): T {
  return ((...args: Parameters<T>) => {
    try {
      return fn(...args);
    } catch (error) {
      captureException(error, context);
      throw error;
    }
  }) as T;
}

/**
 * API Error Handler
 */
export function captureAPIError(
  error: Error | unknown,
  request: {
    method: string;
    url: string;
    body?: any;
    headers?: Record<string, string>;
  },
  response?: {
    status: number;
    statusText?: string;
  }
) {
  const context: ErrorContext = {
    component: 'API',
    action: `${request.method} ${request.url}`,
    additional: {
      request: {
        method: request.method,
        url: request.url,
        hasBody: !!request.body
      },
      response: response
        ? {
            status: response.status,
            statusText: response.statusText
          }
        : undefined
    }
  };

  return captureException(error, context);
}

/**
 * Database Error Handler
 */
export function captureDatabaseError(
  error: Error | unknown,
  operation: string,
  table?: string,
  query?: string
) {
  const context: ErrorContext = {
    component: 'Database',
    action: operation,
    additional: {
      table,
      query: query ? query.substring(0, 200) : undefined // Limit query length
    }
  };

  return captureException(error, context, ErrorSeverity.ERROR);
}

/**
 * Report Generation Error Handler
 */
export function captureReportError(
  error: Error | unknown,
  projectId: string,
  reportType: string,
  step: string
) {
  const context: ErrorContext = {
    component: 'ReportGeneration',
    action: step,
    projectId,
    additional: {
      reportType
    }
  };

  return captureException(error, context, ErrorSeverity.ERROR);
}

/**
 * AI/OpenRouter Error Handler
 */
export function captureAIError(
  error: Error | unknown,
  model: string,
  operation: string,
  tokens?: number
) {
  const context: ErrorContext = {
    component: 'AI',
    action: operation,
    additional: {
      model,
      tokens
    }
  };

  return captureException(error, context, ErrorSeverity.WARNING);
}

/**
 * Email Service Error Handler
 */
export function captureEmailError(
  error: Error | unknown,
  recipients: string[],
  subject: string
) {
  const context: ErrorContext = {
    component: 'Email',
    action: 'send',
    additional: {
      recipientCount: recipients.length,
      subject
    }
  };

  return captureException(error, context, ErrorSeverity.ERROR);
}

/**
 * Flush Sentry events (useful before process termination)
 */
export async function flushSentry(timeout = 2000) {
  if (process.env.NEXT_PUBLIC_SENTRY_DISABLED === 'true') {
    return true;
  }

  return await Sentry.flush(timeout);
}

/**
 * Check if Sentry is enabled
 */
export function isSentryEnabled() {
  return (
    process.env.NEXT_PUBLIC_SENTRY_DISABLED !== 'true' &&
    !!process.env.NEXT_PUBLIC_SENTRY_DSN
  );
}

// Export Sentry for advanced usage
export { Sentry };
