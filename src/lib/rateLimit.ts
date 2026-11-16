import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export type RateLimitCategory = 'contact' | 'comment' | 'like' | 'login' | 'upload';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  upstashWindow: `${number} ${'s' | 'm' | 'h' | 'd'}`;
}

const POLICIES: Record<RateLimitCategory, RateLimitConfig> = {
  contact: { maxRequests: 5, windowMs: 10 * 60 * 1000, upstashWindow: '10 m' }, // 5 requests per 10 min
  comment: { maxRequests: 5, windowMs: 5 * 60 * 1000, upstashWindow: '5 m' },   // 5 comments per 5 min
  like: { maxRequests: 30, windowMs: 60 * 1000, upstashWindow: '1 m' },         // 30 likes per 1 min
  login: { maxRequests: 5, windowMs: 15 * 60 * 1000, upstashWindow: '15 m' },   // 5 login attempts per 15 min
  upload: { maxRequests: 20, windowMs: 10 * 60 * 1000, upstashWindow: '10 m' }, // 20 uploads per 10 min
};

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  serviceUnavailable?: boolean;
  error?: string;
}

// In-Memory Token Bucket / Sliding Window for local development runtime ONLY (bound to globalThis to survive HMR)
interface MemoryRecord {
  timestamps: number[];
}

const globalForRateLimit = globalThis as unknown as {
  memoryStore?: Map<string, MemoryRecord>;
};

const memoryStore =
  globalForRateLimit.memoryStore ?? new Map<string, MemoryRecord>();

if (!globalForRateLimit.memoryStore) {
  globalForRateLimit.memoryStore = memoryStore;
}

// Clean up stale memory records periodically (every 5 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of memoryStore.entries()) {
      record.timestamps = record.timestamps.filter((ts) => now - ts < 15 * 60 * 1000);
      if (record.timestamps.length === 0) {
        memoryStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

// Upstash Redis initialization
let upstashLimiters: Record<RateLimitCategory, Ratelimit> | null = null;
let redisInitialized = false;

function getUpstashLimiters(): Record<RateLimitCategory, Ratelimit> | null {
  if (redisInitialized) return upstashLimiters;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token && url.startsWith('http')) {
    try {
      const redis = new Redis({ url, token });
      upstashLimiters = {
        contact: new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(POLICIES.contact.maxRequests, POLICIES.contact.upstashWindow),
          prefix: 'rl:contact',
        }),
        comment: new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(POLICIES.comment.maxRequests, POLICIES.comment.upstashWindow),
          prefix: 'rl:comment',
        }),
        like: new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(POLICIES.like.maxRequests, POLICIES.like.upstashWindow),
          prefix: 'rl:like',
        }),
        login: new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(POLICIES.login.maxRequests, POLICIES.login.upstashWindow),
          prefix: 'rl:login',
        }),
        upload: new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(POLICIES.upload.maxRequests, POLICIES.upload.upstashWindow),
          prefix: 'rl:upload',
        }),
      };
      redisInitialized = true;
      return upstashLimiters;
    } catch (e) {
      console.error('Failed to initialize Upstash Redis rate limiter:', e);
    }
  }

  redisInitialized = true;
  return null;
}

export function getClientIp(request: Request): string {
  // Check x-real-ip header first (typically set by reverse proxy like Nginx or Cloudflare)
  const realIp = request.headers.get('x-real-ip');
  if (realIp && isValidIp(realIp.trim())) {
    return realIp.trim();
  }

  // Parse x-forwarded-for: take the leftmost client IP
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const clientIp = forwardedFor.split(',')[0].trim();
    if (isValidIp(clientIp)) {
      return clientIp;
    }
  }

  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  if (cfConnectingIp && isValidIp(cfConnectingIp.trim())) {
    return cfConnectingIp.trim();
  }

  return '127.0.0.1';
}

function isValidIp(ip: string): boolean {
  const ipv4Regex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

export async function checkRateLimit(
  category: RateLimitCategory,
  ip: string
): Promise<RateLimitResult> {
  const isProduction = process.env.NODE_ENV === 'production';
  const upstash = getUpstashLimiters();

  // In production, distributed Redis rate limiting is MANDATORY.
  // In-memory fallback is disabled in production to guarantee multi-instance protection.
  if (isProduction) {
    if (!upstash || !upstash[category]) {
      console.error(
        `[CRITICAL SECURITY] Upstash Redis rate limiting is not configured in production for '${category}'. In-memory fallback is disallowed in production.`
      );
      return {
        success: false,
        limit: 0,
        remaining: 0,
        reset: Math.ceil(Date.now() / 1000) + 60,
        serviceUnavailable: true,
        error: 'Rate limiting service is unconfigured or unavailable in production.',
      };
    }

    try {
      const res = await upstash[category].limit(`${category}:${ip}`);
      return {
        success: res.success,
        limit: res.limit,
        remaining: res.remaining,
        reset: Math.ceil(res.reset / 1000),
      };
    } catch (err) {
      console.error(`[CRITICAL SECURITY] Upstash Redis call failed in production:`, err);
      // Fail closed: reject request to protect against brute-force or spam during Redis outage
      return {
        success: false,
        limit: 0,
        remaining: 0,
        reset: Math.ceil(Date.now() / 1000) + 60,
        serviceUnavailable: true,
        error: 'Rate limiting service temporarily unavailable.',
      };
    }
  }

  // Local development / non-production runtime:
  // If Upstash is configured, use it; otherwise fall back to local in-memory sliding window
  if (upstash && upstash[category]) {
    try {
      const res = await upstash[category].limit(`${category}:${ip}`);
      return {
        success: res.success,
        limit: res.limit,
        remaining: res.remaining,
        reset: Math.ceil(res.reset / 1000),
      };
    } catch (err) {
      console.warn(`Upstash rate limiting failed in dev, using memory store:`, err);
    }
  }

  // Local development in-memory sliding window
  const policy = POLICIES[category];
  const now = Date.now();
  const key = `${category}:${ip}`;

  let record = memoryStore.get(key);
  if (!record) {
    record = { timestamps: [] };
    memoryStore.set(key, record);
  }

  // Purge timestamps older than the window
  record.timestamps = record.timestamps.filter((ts) => now - ts < policy.windowMs);

  if (record.timestamps.length >= policy.maxRequests) {
    const oldest = record.timestamps[0];
    const resetTime = Math.ceil((oldest + policy.windowMs) / 1000);
    return {
      success: false,
      limit: policy.maxRequests,
      remaining: 0,
      reset: resetTime,
    };
  }

  record.timestamps.push(now);
  const remaining = policy.maxRequests - record.timestamps.length;
  const resetTime = Math.ceil((now + policy.windowMs) / 1000);

  return {
    success: true,
    limit: policy.maxRequests,
    remaining,
    reset: resetTime,
  };
}
