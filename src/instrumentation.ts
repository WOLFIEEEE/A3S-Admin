import * as Sentry from '@sentry/nextjs';

// const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

const sentryOptions: Sentry.NodeOptions | Sentry.EdgeOptions = {
  // Sentry DSN
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Environment
  environment: process.env.NODE_ENV || 'development',

  // Release tracking
  release: process.env.NEXT_PUBLIC_APP_VERSION || 'unknown',

  // Enable Spotlight in development for debugging
  spotlight: isDevelopment,

  // Sample rate for transactions (performance monitoring)
  // 1.0 = 100% in development, 0.1 = 10% in production
  tracesSampleRate: isDevelopment ? 1.0 : 0.1,

  // Sample rate for profiling
  profilesSampleRate: isDevelopment ? 1.0 : 0.1,

  // Send user IP and headers (helpful for debugging)
  sendDefaultPii: isDevelopment,

  // Enable error normalization
  normalizeDepth: 10,

  // Maximum breadcrumbs
  maxBreadcrumbs: 50,

  // Add integrations
  integrations: [
    // Postgres integration if available
    ...(process.env.NEXT_RUNTIME === 'nodejs'
      ? [Sentry.postgresIntegration()]
      : [])
  ],

  // Before send hook - sanitize sensitive data
  beforeSend(event) {
    // Remove sensitive data from request bodies
    if (event.request?.data) {
      const data = event.request.data as Record<string, any>;
      if (typeof data === 'object' && data !== null) {
        ['password', 'token', 'api_key', 'secret', 'apiKey'].forEach((key) => {
          if (key in data) {
            data[key] = '[Filtered]';
          }
        });
      }
    }

    // In development, log errors to console
    if (isDevelopment) {
    }

    return event;
  },

  // Ignore certain errors
  ignoreErrors: [
    // Browser extensions
    'top.GLOBALS',
    // Random network errors
    'NetworkError',
    'Network request failed',
    // User cancelled actions
    'AbortError',
    'User cancelled',
    // Not actionable errors
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured'
  ],

  // Debug mode (only in development)
  debug: isDevelopment,

  // Attach stack traces to messages
  attachStacktrace: true
};

export async function register() {
  if (process.env.NEXT_PUBLIC_SENTRY_DISABLED === 'true') {
    return;
  }

  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
    return;
  }

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Node.js Sentry configuration
    Sentry.init(sentryOptions);
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    // Edge Sentry configuration
    Sentry.init(sentryOptions);
  }
}

export const onRequestError = Sentry.captureRequestError;
