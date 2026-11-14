import { createClient, SupabaseClient } from '@supabase/supabase-js';
import crypto from 'crypto';

let supabaseAdminClient: SupabaseClient | null = null;
let supabasePublicClient: SupabaseClient | null = null;

/**
 * Returns the configured Supabase Project URL.
 */
export function getSupabaseUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
}

/**
 * Returns the public publishable key (with backward-compatible anon key fallback).
 * Safe for use in public browser/client environments under RLS protection.
 */
export function getSupabasePublishableKey(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  );
}

/**
 * Returns the private server-side secret key (with backward-compatible service role key fallback).
 * Strictly server-side: NEVER expose to client bundles or browser code.
 */
export function getSupabaseSecretKey(): string | undefined {
  return (
    process.env.SUPABASE_SECRET_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  );
}

/**
 * Validates that the Supabase environment variables are well-formed.
 */
export function validateSupabaseEnv(): {
  valid: boolean;
  hasUrl: boolean;
  hasPublishableKey: boolean;
  hasSecretKey: boolean;
  errors: string[];
} {
  const url = getSupabaseUrl();
  const pubKey = getSupabasePublishableKey();
  const secretKey = getSupabaseSecretKey();
  const errors: string[] = [];

  const hasUrl = Boolean(url && url.startsWith('http'));
  if (!hasUrl) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL must be a valid HTTP/HTTPS URL.');
  }

  const hasPublishableKey = Boolean(pubKey && pubKey.length > 10);
  if (!hasPublishableKey) {
    errors.push('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is missing or invalid.');
  }

  const hasSecretKey = Boolean(secretKey && secretKey.length > 10);
  if (!hasSecretKey) {
    errors.push('SUPABASE_SECRET_KEY is missing or invalid.');
  }

  return {
    valid: hasUrl && hasSecretKey,
    hasUrl,
    hasPublishableKey,
    hasSecretKey,
    errors,
  };
}

/**
 * Checks if Supabase server-side database access is properly configured.
 */
export function isSupabaseConfigured(): boolean {
  const url = getSupabaseUrl();
  const secretKey = getSupabaseSecretKey();
  return Boolean(
    url &&
    url.startsWith('http') &&
    secretKey &&
    secretKey.length > 10
  );
}

/**
 * Returns the server-side administrative Supabase client configured with SUPABASE_SECRET_KEY.
 * Disables session persistence and auto-token refresh for stateless server execution.
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (supabaseAdminClient) return supabaseAdminClient;

  const url = getSupabaseUrl();
  const secretKey = getSupabaseSecretKey();

  if (!url || !secretKey || !url.startsWith('http') || secretKey.length <= 10) {
    return null;
  }

  try {
    supabaseAdminClient = createClient(url, secretKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
    return supabaseAdminClient;
  } catch (err) {
    console.error('Failed to initialize Supabase admin client:', err);
    return null;
  }
}

/**
 * Returns a public Supabase client configured with NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.
 * Subject to PostgreSQL Row Level Security (RLS) policies.
 */
export function getSupabasePublicClient(): SupabaseClient | null {
  if (supabasePublicClient) return supabasePublicClient;

  const url = getSupabaseUrl();
  const pubKey = getSupabasePublishableKey();

  if (!url || !pubKey || !url.startsWith('http') || pubKey.length <= 10) {
    return null;
  }

  try {
    supabasePublicClient = createClient(url, pubKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    return supabasePublicClient;
  } catch (err) {
    console.error('Failed to initialize Supabase public client:', err);
    return null;
  }
}

/**
 * Server-generated privacy-preserving visitor identifier.
 * Uses HMAC-SHA256 with a server-side secret to prevent visitor spoofing.
 */
export function generateVisitorHash(ip: string, userAgent?: string | null): string {
  const salt = process.env.ADMIN_SESSION_SECRET || process.env.BLOG_ADMIN_PASSCODE || 'nayem-hash-salt';
  const raw = `${ip}::${(userAgent || '').trim().slice(0, 150)}`;
  return crypto.createHmac('sha256', salt).update(raw).digest('hex');
}
