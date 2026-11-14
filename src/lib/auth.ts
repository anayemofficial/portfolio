import crypto from 'crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const COOKIE_NAME = 'admin_session';
const CSRF_COOKIE_NAME = 'admin_csrf';
const SESSION_DURATION_SECONDS = 60 * 60 * 24; // 24 hours

export interface SessionPayload {
  sub: string;
  role: 'admin';
  jti: string;  // Unique session identifier for revocation
  csrf: string; // Cryptographic anti-CSRF token
  iat: number;
  exp: number;
}

// In-Memory revocation store for local development / fallback (bound to globalThis to survive App Router HMR / re-evaluations)
const globalForAuth = globalThis as unknown as {
  inMemoryRevokedSessions?: Map<string, number>;
};

const inMemoryRevokedSessions =
  globalForAuth.inMemoryRevokedSessions ?? new Map<string, number>();

if (!globalForAuth.inMemoryRevokedSessions) {
  globalForAuth.inMemoryRevokedSessions = inMemoryRevokedSessions;
}

// Clean up expired revocations periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Math.floor(Date.now() / 1000);
    for (const [jti, exp] of inMemoryRevokedSessions.entries()) {
      if (exp <= now) {
        inMemoryRevokedSessions.delete(jti);
      }
    }
  }, 10 * 60 * 1000);
}

function getRedisClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token && url.startsWith('http')) {
    try {
      return new Redis({ url, token });
    } catch {
      return null;
    }
  }
  return null;
}

export function isAuthConfigured(): boolean {
  const passcode = process.env.BLOG_ADMIN_PASSCODE;
  return Boolean(passcode && passcode.trim().length > 0);
}

function getSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (secret && secret.trim().length >= 16) {
    return secret.trim();
  }
  const passcode = process.env.BLOG_ADMIN_PASSCODE;
  if (!passcode) {
    throw new Error('Server security error: BLOG_ADMIN_PASSCODE is not configured.');
  }
  return crypto.createHash('sha256').update(`fallback-salt:${passcode}`).digest('hex');
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf-8');
}

export function verifyAdminPasscode(inputPasscode: string): boolean {
  const envPasscode = process.env.BLOG_ADMIN_PASSCODE;
  if (!envPasscode || !inputPasscode) {
    return false;
  }

  const inputBuffer = Buffer.from(inputPasscode);
  const targetBuffer = Buffer.from(envPasscode);

  if (inputBuffer.length !== targetBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(inputBuffer, targetBuffer);
}

export function createSessionToken(): { token: string; csrfToken: string; jti: string } {
  const secret = getSessionSecret();
  const now = Math.floor(Date.now() / 1000);
  const jti = crypto.randomUUID();
  const csrfToken = crypto.randomBytes(32).toString('hex');

  const payload: SessionPayload = {
    sub: 'author',
    role: 'admin',
    jti,
    csrf: csrfToken,
    iat: now,
    exp: now + SESSION_DURATION_SECONDS,
  };

  const payloadEncoded = base64UrlEncode(JSON.stringify(payload));
  const signature = crypto
    .createHmac('sha256', secret)
    .update(payloadEncoded)
    .digest('base64url');

  return {
    token: `${payloadEncoded}.${signature}`,
    csrfToken,
    jti,
  };
}

export async function isSessionRevoked(jti: string): Promise<boolean> {
  // Check Redis if available
  const redis = getRedisClient();
  if (redis) {
    try {
      const revoked = await redis.get(`revoked:${jti}`);
      if (revoked) return true;
    } catch (e) {
      console.warn('Failed to query Redis revocation list:', e);
    }
  }

  // Check in-memory store
  const exp = inMemoryRevokedSessions.get(jti);
  if (exp) {
    if (exp > Math.floor(Date.now() / 1000)) {
      return true;
    }
    inMemoryRevokedSessions.delete(jti);
  }

  return false;
}

export async function revokeSession(token: string): Promise<void> {
  const payload = parseAndVerifyTokenSignature(token);
  if (!payload?.jti) return;

  const ttl = Math.max(1, payload.exp - Math.floor(Date.now() / 1000));

  // Revoke in Redis if available
  const redis = getRedisClient();
  if (redis) {
    try {
      await redis.set(`revoked:${payload.jti}`, '1', { ex: ttl });
    } catch (e) {
      console.warn('Failed to record revocation in Redis:', e);
    }
  }

  // Revoke in memory store
  inMemoryRevokedSessions.set(payload.jti, payload.exp);
}

function parseAndVerifyTokenSignature(token: string): SessionPayload | null {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadEncoded, signature] = parts;

  try {
    const secret = getSessionSecret();
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payloadEncoded)
      .digest('base64url');

    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (sigBuffer.length !== expectedBuffer.length) {
      return null;
    }

    if (!crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
      return null;
    }

    const payloadJson = base64UrlDecode(payloadEncoded);
    const payload: SessionPayload = JSON.parse(payloadJson);

    const now = Math.floor(Date.now() / 1000);
    if (!payload.exp || payload.exp < now) {
      return null; // Expired
    }

    if (payload.role !== 'admin' || !payload.jti) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  const payload = parseAndVerifyTokenSignature(token);
  if (!payload) return null;

  // Verify that the session has not been explicitly revoked server-side
  const revoked = await isSessionRevoked(payload.jti);
  if (revoked) {
    return null;
  }

  return payload;
}

export async function checkAdminSession(): Promise<{ authenticated: boolean; csrfToken: string | null }> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(COOKIE_NAME);
    if (!sessionCookie?.value) return { authenticated: false, csrfToken: null };

    const payload = await verifySessionToken(sessionCookie.value);
    if (!payload) return { authenticated: false, csrfToken: null };

    return { authenticated: true, csrfToken: payload.csrf || null };
  } catch {
    return { authenticated: false, csrfToken: null };
  }
}

function validateOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) {
    // If origin is missing, check referer
    const referer = request.headers.get('referer');
    if (!referer) return true; // Direct non-browser request or same-origin without referer
    try {
      const refererHost = new URL(referer).host;
      const requestHost = request.headers.get('host') || new URL(request.url).host;
      return refererHost === requestHost;
    } catch {
      return false;
    }
  }

  try {
    const originHost = new URL(origin).host;
    const requestHost = request.headers.get('host') || new URL(request.url).host;
    return originHost === requestHost;
  } catch {
    return false;
  }
}

export async function verifyAdminRequest(
  request: Request,
  options?: { requireCsrfForMutations?: boolean }
): Promise<{ authorized: boolean; reason?: string; statusCode?: number; csrfToken?: string }> {
  if (!isAuthConfigured()) {
    return {
      authorized: false,
      reason: 'Admin passcode is not configured in server environment.',
      statusCode: 503,
    };
  }

  const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method.toUpperCase());
  const requireCsrf = options?.requireCsrfForMutations !== false;

  // 1. Check HTTP-only session cookie
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));

  if (match && match[1]) {
    const session = await verifySessionToken(decodeURIComponent(match[1]));
    if (session) {
      // If this is a cookie-authenticated mutating request, enforce strict CSRF protection
      if (isMutation && requireCsrf) {
        // A. Validate Origin / Referer
        if (!validateOrigin(request)) {
          return {
            authorized: false,
            reason: 'Forbidden: Cross-Origin request rejected.',
            statusCode: 403,
          };
        }

        // B. Validate Anti-CSRF Token
        const clientCsrf =
          request.headers.get('x-csrf-token') ||
          request.headers.get('x-xsrf-token');

        if (!clientCsrf || typeof clientCsrf !== 'string') {
          return {
            authorized: false,
            reason: 'Forbidden: Missing CSRF protection token.',
            statusCode: 403,
          };
        }

        const clientCsrfBuffer = Buffer.from(clientCsrf.trim());
        const sessionCsrfBuffer = Buffer.from(session.csrf);

        if (
          clientCsrfBuffer.length !== sessionCsrfBuffer.length ||
          !crypto.timingSafeEqual(clientCsrfBuffer, sessionCsrfBuffer)
        ) {
          return {
            authorized: false,
            reason: 'Forbidden: Invalid or mismatched CSRF token.',
            statusCode: 403,
          };
        }
      }

      return { authorized: true, csrfToken: session.csrf };
    }
  }

  // 2. Fallback: Check x-admin-passcode header (strictly for server-to-server or test automation)
  const headerPasscode = request.headers.get('x-admin-passcode');
  if (headerPasscode && verifyAdminPasscode(headerPasscode)) {
    return { authorized: true };
  }

  return {
    authorized: false,
    reason: 'Unauthorized: Valid admin session or passcode required.',
    statusCode: 401,
  };
}

export function attachSessionCookie(
  response: NextResponse,
  token: string,
  csrfToken: string
): void {
  // 1. HttpOnly Admin Session Cookie
  response.cookies.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DURATION_SECONDS,
  });

  // 2. Client-Readable CSRF Cookie for Double-Submit Verification
  response.cookies.set({
    name: CSRF_COOKIE_NAME,
    value: csrfToken,
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set({
    name: COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  response.cookies.set({
    name: CSRF_COOKIE_NAME,
    value: '',
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}
