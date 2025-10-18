/**
 * Environment variable validation for production deployment
 * This ensures all required environment variables are present and valid
 */

interface RequiredEnvVars {
  // Database
  DATABASE_URL: string;

  // Authentication (Clerk)
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string;
  CLERK_SECRET_KEY: string;

  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;

  // Email (Resend)
  RESEND_API_KEY: string;

  // AI (OpenRouter)
  OPENROUTER_API_KEY: string;
}

interface OptionalEnvVars {
  // Application
  NEXT_PUBLIC_APP_URL?: string;

  // Google Sheets (optional)
  GOOGLE_SHEETS_PRIVATE_KEY?: string;
  GOOGLE_SHEETS_CLIENT_EMAIL?: string;

  // Sentry (optional)
  NEXT_PUBLIC_SENTRY_DSN?: string;
  NEXT_PUBLIC_SENTRY_ORG?: string;
  NEXT_PUBLIC_SENTRY_PROJECT?: string;
  SENTRY_AUTH_TOKEN?: string;
}

type EnvVars = RequiredEnvVars & OptionalEnvVars;

/**
 * Validates that all required environment variables are present
 */
export function validateEnvironmentVariables(): {
  isValid: boolean;
  missing: string[];
  warnings: string[];
} {
  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  const requiredVars: (keyof RequiredEnvVars)[] = [
    'DATABASE_URL',
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'RESEND_API_KEY',
    'OPENROUTER_API_KEY'
  ];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  // Check for common issues
  if (
    process.env.DATABASE_URL &&
    !process.env.DATABASE_URL.includes('pooler.supabase.com')
  ) {
    warnings.push(
      'DATABASE_URL should use Supabase connection pooler for production'
    );
  }

  if (
    process.env.NEXT_PUBLIC_APP_URL &&
    process.env.NEXT_PUBLIC_APP_URL.includes('localhost')
  ) {
    warnings.push(
      'NEXT_PUBLIC_APP_URL is set to localhost - update for production'
    );
  }

  return {
    isValid: missing.length === 0,
    missing,
    warnings
  };
}

/**
 * Gets environment variables with type safety
 */
export function getEnvVars(): EnvVars {
  const validation = validateEnvironmentVariables();

  if (!validation.isValid) {
    throw new Error(
      `Missing required environment variables: ${validation.missing.join(', ')}`
    );
  }

  if (validation.warnings.length > 0) {
    console.warn('Environment variable warnings:', validation.warnings);
  }

  return {
    // Required
    DATABASE_URL: process.env.DATABASE_URL!,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY!,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    RESEND_API_KEY: process.env.RESEND_API_KEY!,
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY!,

    // Optional
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    GOOGLE_SHEETS_PRIVATE_KEY: process.env.GOOGLE_SHEETS_PRIVATE_KEY,
    GOOGLE_SHEETS_CLIENT_EMAIL: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_SENTRY_ORG: process.env.NEXT_PUBLIC_SENTRY_ORG,
    NEXT_PUBLIC_SENTRY_PROJECT: process.env.NEXT_PUBLIC_SENTRY_PROJECT,
    SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN
  };
}

/**
 * Validates environment on startup (for server-side)
 */
export function validateOnStartup() {
  if (typeof window === 'undefined') {
    // Server-side only
    // Skip validation during build process
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return;
    }

    const validation = validateEnvironmentVariables();

    if (!validation.isValid) {
      // eslint-disable-next-line no-console
      console.error('❌ Environment validation failed!');
      // eslint-disable-next-line no-console
      console.error('Missing variables:', validation.missing);

      if (process.env.NODE_ENV === 'production') {
        throw new Error(
          'Production deployment failed: Missing required environment variables'
        );
      }
    } else {
      // eslint-disable-next-line no-console
      console.log('✅ Environment variables validated successfully');

      if (validation.warnings.length > 0) {
        // eslint-disable-next-line no-console
        console.warn('⚠️  Environment warnings:', validation.warnings);
      }
    }
  }
}
