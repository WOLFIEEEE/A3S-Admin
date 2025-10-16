import { drizzle } from 'drizzle-orm/postgres-js';
import { createClient } from '@supabase/supabase-js';
const postgres = require('postgres');
import * as schema from './schema';

// Load environment variables if not already loaded
if (typeof process.env.DATABASE_URL === 'undefined') {
  try {
    require('dotenv').config({ path: '.env.local' });
  } catch (error) {
    // dotenv not available or .env.local not found
  }
}

// Environment variables
const DATABASE_URL = process.env.DATABASE_URL;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Supabase environment variables are required');
}

// PostgreSQL connection for Drizzle
const connectionString = DATABASE_URL;
const client = postgres(connectionString, {
  prepare: false,
  max: 20, // Maximum number of connections
  idle_timeout: 20, // Close idle connections after 20 seconds
  connect_timeout: 10, // Connection timeout
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: true }
      : process.env.DATABASE_URL?.includes('localhost')
        ? false
        : { rejectUnauthorized: false } // Allow self-signed certs in dev
});

// Drizzle database instance with schema
export const db = drizzle(client, { schema });

// Supabase client for auth and real-time features
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Supabase client for server-side operations (with service role key)
export const supabaseAdmin = createClient(
  SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Connection health check
export async function checkDatabaseConnection() {
  try {
    await client`SELECT 1`;
    return { success: true, message: 'Database connection healthy' };
  } catch (error) {
    return {
      success: false,
      message: `Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

// Graceful shutdown
export async function closeDatabaseConnection() {
  try {
    await client.end();
    // Database connection closed successfully
  } catch (error) {
    // Error closing database connection - this should be handled by the calling code
    throw new Error(
      `Failed to close database connection: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export type Database = typeof db;
