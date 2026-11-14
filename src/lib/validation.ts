import { z } from 'zod';

/**
 * Escapes characters that have HTML/XML entity meaning to neutralize Stored XSS.
 */
export function sanitizeText(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

/**
 * Validates that an image or resource URL is strictly safe.
 * Rejects javascript:, data:, vbscript: and non-HTTPS protocols (allowing relative paths and localhost).
 */
export function isValidSafeUrl(urlString?: string | null): boolean {
  if (!urlString || typeof urlString !== 'string') return true; // Optional URLs can be empty
  const trimmed = urlString.trim();
  if (trimmed === '') return true;

  // Allow relative URLs starting with /
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return true;
  }

  try {
    const parsed = new URL(trimmed);
    // Allow https protocols and local dev http
    if (parsed.protocol === 'https:') return true;
    if (parsed.protocol === 'http:' && (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1')) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// Contact Form Schema
export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters.')
    .max(100, 'Name cannot exceed 100 characters.')
    .transform(sanitizeText),
  email: z
    .string()
    .trim()
    .email('Please enter a valid email address.')
    .max(254, 'Email cannot exceed 254 characters.')
    .toLowerCase(),
  subject: z
    .string()
    .trim()
    .min(2, 'Subject must be at least 2 characters.')
    .max(200, 'Subject cannot exceed 200 characters.')
    .transform(sanitizeText),
  message: z
    .string()
    .trim()
    .min(10, 'Message must be at least 10 characters.')
    .max(5000, 'Message cannot exceed 5000 characters.')
    .transform(sanitizeText),
});

// Blog Comment Schema
export const commentSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters.')
    .max(80, 'Name cannot exceed 80 characters.')
    .transform(sanitizeText),
  email: z
    .string()
    .trim()
    .email('Please enter a valid email address.')
    .max(254, 'Email cannot exceed 254 characters.')
    .toLowerCase(),
  comment: z
    .string()
    .trim()
    .min(2, 'Comment must be at least 2 characters.')
    .max(1000, 'Comment cannot exceed 1000 characters.')
    .transform(sanitizeText),
});

// Blog Post Creation Schema
export const postCreateSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Title must be at least 3 characters.')
    .max(200, 'Title cannot exceed 200 characters.')
    .transform(sanitizeText),
  content: z
    .string()
    .trim()
    .min(10, 'Content must be at least 10 characters.')
    .max(50000, 'Content cannot exceed 50,000 characters.'),
  excerpt: z
    .string()
    .trim()
    .max(500, 'Excerpt cannot exceed 500 characters.')
    .optional()
    .transform((val) => (val ? sanitizeText(val) : undefined)),
  category: z
    .string()
    .trim()
    .max(60, 'Category cannot exceed 60 characters.')
    .optional()
    .default('Daily Thoughts')
    .transform((val) => sanitizeText(val)),
  mood: z
    .string()
    .trim()
    .max(60)
    .optional()
    .transform((val) => (val ? sanitizeText(val) : undefined)),
  tags: z
    .union([z.array(z.string()), z.string()])
    .optional()
    .transform((val) => {
      if (!val) return [];
      const list = Array.isArray(val) ? val : val.split(',');
      return list
        .map((t) => sanitizeText(t.trim()))
        .filter((t) => t.length > 0 && t.length <= 40)
        .slice(0, 10);
    }),
  coverImage: z
    .string()
    .max(1000, 'Cover image URL cannot exceed 1000 characters.')
    .optional()
    .refine((url) => isValidSafeUrl(url), {
      message: 'Cover image URL must be a valid safe URL (https or relative path).',
    }),
  authorAvatar: z
    .string()
    .max(1000, 'Author avatar URL cannot exceed 1000 characters.')
    .optional()
    .refine((url) => isValidSafeUrl(url), {
      message: 'Author avatar URL must be a valid safe URL (https or relative path).',
    }),
  isPrivate: z.boolean().optional().default(false),
});

// Blog Post Patch Schema
export const postPatchSchema = z.object({
  id: z.string().trim().min(1, 'Post ID is required').max(100),
  action: z.enum(['togglePrivacy', 'edit']),
  title: z.string().trim().min(3).max(200).optional(),
  content: z.string().trim().min(10).max(50000).optional(),
  excerpt: z.string().trim().max(500).optional(),
  category: z.string().trim().max(60).optional(),
  mood: z.string().trim().max(60).optional(),
  tags: z.union([z.array(z.string()), z.string()]).optional(),
  coverImage: z.string().max(1000).optional(),
  isPrivate: z.boolean().optional(),
});

// Blog Post Full Update (PUT) Schema
export const postUpdateSchema = z.object({
  id: z.string().trim().min(1, 'Post ID is required').max(100),
  title: z.string().trim().min(3, 'Title must be at least 3 characters.').max(200).optional(),
  content: z.string().trim().min(10, 'Content must be at least 10 characters.').max(50000).optional(),
  excerpt: z.string().trim().max(500).optional(),
  category: z.string().trim().max(60).optional(),
  mood: z.string().trim().max(60).optional(),
  tags: z.union([z.array(z.string()), z.string()]).optional(),
  coverImage: z.string().max(1000).optional(),
  isPrivate: z.boolean().optional(),
});

// Supabase Environment Variable Schema
export const supabaseEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .trim()
    .url('NEXT_PUBLIC_SUPABASE_URL must be a valid HTTP or HTTPS URL.'),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z
    .string()
    .trim()
    .min(10, 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is required and must be valid.'),
  SUPABASE_SECRET_KEY: z
    .string()
    .trim()
    .min(10, 'SUPABASE_SECRET_KEY is required on the server.'),
});

/**
 * Validates Supabase environment variables against the schema.
 */
export function validateSupabaseEnvironment(env: Record<string, string | undefined> = process.env) {
  const result = supabaseEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SECRET_KEY: env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY,
  });

  if (!result.success) {
    return {
      valid: false,
      errors: result.error.issues.map((issue) => issue.message),
    };
  }

  return {
    valid: true,
    data: result.data,
  };
}

/**
 * Checks request Content-Length header against max allowed bytes.
 */
export function isPayloadSizeAllowed(request: Request, maxBytes: number): boolean {
  const contentLength = request.headers.get('content-length');
  if (contentLength) {
    const bytes = parseInt(contentLength, 10);
    if (!isNaN(bytes) && bytes > maxBytes) {
      return false;
    }
  }
  return true;
}
