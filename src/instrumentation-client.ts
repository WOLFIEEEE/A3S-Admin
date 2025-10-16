/**
 * Sentry Client Configuration
 *
 * Configures Sentry for the browser/client-side
 * Includes session replay, performance monitoring, and error tracking
 */

import * as Sentry from '@sentry/nextjs';

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

if (
  process.env.NEXT_PUBLIC_SENTRY_DISABLED !== 'true' &&
  process.env.NEXT_PUBLIC_SENTRY_DSN
) {
  Sentry.init({
    // Sentry DSN
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    // Environment
    environment: process.env.NODE_ENV || 'development',

    // Release version
    release: process.env.NEXT_PUBLIC_APP_VERSION || 'unknown',

    // Trace propagation targets (for distributed tracing)
    tracePropagationTargets: [
      'localhost',
      /^https:\/\/[^/]*\.vercel\.app/,
      /^https:\/\/[^/]*\.a3s\.com/
    ],

    // Integrations
    integrations: [
      // Browser tracing for performance monitoring
      Sentry.browserTracingIntegration(),

      // Session replay integration
      Sentry.replayIntegration({
        // Mask all text content
        maskAllText: isProduction,
        // Block all media elements
        blockAllMedia: isProduction,
        // Network details recording
        networkDetailAllowUrls: isDevelopment ? ['*'] : [],
        networkCaptureBodies: isDevelopment
      }),

      // Browser profiling
      Sentry.browserProfilingIntegration(),

      // Feedback integration for user feedback
      Sentry.feedbackIntegration({
        colorScheme: 'system',
        showBranding: false
      })
    ],

    // Performance monitoring
    tracesSampleRate: isDevelopment ? 1.0 : 0.1,

    // Profiling sample rate
    profilesSampleRate: isDevelopment ? 1.0 : 0.05,

    // Session Replay sample rates
    // Record 100% of sessions with errors, 10% of normal sessions
    replaysSessionSampleRate: isDevelopment ? 1.0 : 0.1,
    replaysOnErrorSampleRate: 1.0,

    // Send PII (only in development)
    sendDefaultPii: isDevelopment,

    // Maximum breadcrumbs to keep
    maxBreadcrumbs: 50,

    // Normalize error depth
    normalizeDepth: 10,

    // Before send hook - sanitize sensitive data
    beforeSend(event, hint) {
      // Remove sensitive data
      if (event.request?.cookies) {
        event.request.cookies = {};
      }

      // Sanitize headers
      if (event.request?.headers) {
        const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
        sensitiveHeaders.forEach((header) => {
          if (event.request?.headers?.[header]) {
            event.request.headers[header] = '[Filtered]';
          }
        });
      }

      // Log in development
      if (isDevelopment) {
      }

      return event;
    },

    // Ignore certain errors
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      'ChunkLoadError',
      // Network errors
      'NetworkError',
      'Network request failed',
      'Failed to fetch',
      // User actions
      'AbortError',
      'User cancelled',
      // Non-actionable
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
      'Non-Error promise rejection captured',
      // Ad blockers
      'adsbygoogle',
      // Common browser issues
      'SecurityError',
      'NotAllowedError: Write permission denied'
    ],

    // Deny URLs (don't report errors from these sources)
    denyUrls: [
      // Browser extensions
      /extensions\//i,
      /^chrome:\/\//i,
      /^moz-extension:\/\//i,
      // Social media widgets
      /graph\.facebook\.com/i,
      /connect\.facebook\.net/i,
      /platform\.twitter\.com/i,
      // Analytics
      /googletagmanager\.com/i,
      /google-analytics\.com/i
    ],

    // Debug mode
    debug: isDevelopment,

    // Attach stacktraces to messages
    attachStacktrace: true,

    // Initial scope configuration
    initialScope: {
      tags: {
        runtime: 'browser',
        application: 'a3s-admin'
      }
    }
  });

  // Log initialization
  if (isDevelopment) {
  }
} else {
  if (isDevelopment) {
  }
}

// Export router transition capture
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
