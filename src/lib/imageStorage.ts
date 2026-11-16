import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { BlogPost } from '@/data/initialBlogs';

export const BLOG_IMAGES_BUCKET = 'blog-images';
export const SIGNED_URL_DEFAULT_EXPIRY = 15 * 60; // 15 minutes in seconds

/**
 * Normalizes any cover image input (signed URL, legacy public URL, or raw filename)
 * into a canonical storage path for persistent database storage (e.g., 'blog-images/post_123.jpg').
 * External URLs (Unsplash, etc.) and local development paths (/uploads/...) remain intact.
 */
export function normalizeStoragePath(coverImage?: string | null): string | null {
  if (!coverImage || typeof coverImage !== 'string') return null;
  const trimmed = coverImage.trim();
  if (!trimmed) return null;

  // 1. If it's a Supabase storage URL (signed or public), extract the relative path
  const supabasePattern = /\/storage\/v1\/object\/(?:sign|public)\/blog-images\/([^?#]+)/;
  const match = trimmed.match(supabasePattern);
  if (match && match[1]) {
    const filename = decodeURIComponent(match[1]);
    return `${BLOG_IMAGES_BUCKET}/${filename}`;
  }

  // 2. If it's already a storage path starting with bucket name
  if (trimmed.startsWith(`${BLOG_IMAGES_BUCKET}/`)) {
    return trimmed;
  }

  // 3. If prefixed with storage: protocol
  if (trimmed.startsWith('storage:')) {
    return trimmed.replace(/^storage:/, '');
  }

  // 4. Return standard external URLs or relative paths as-is
  return trimmed;
}

/**
 * Resolves a stored cover image identifier (storage path, legacy URL, or external URL)
 * into a temporary signed URL if it resides in the private blog-images Supabase Storage bucket.
 */
export async function resolveSignedCoverImage(
  coverImage?: string | null,
  expiresInSeconds: number = SIGNED_URL_DEFAULT_EXPIRY
): Promise<string | undefined> {
  if (!coverImage || typeof coverImage !== 'string') return undefined;
  const trimmed = coverImage.trim();
  if (!trimmed) return undefined;

  const supabase = getSupabaseAdmin();
  const isStorageReady = isSupabaseConfigured() && supabase;

  // Check if target is in the blog-images storage bucket
  let objectKey: string | null = null;

  if (trimmed.startsWith(`${BLOG_IMAGES_BUCKET}/`)) {
    objectKey = trimmed.slice(`${BLOG_IMAGES_BUCKET}/`.length);
  } else if (trimmed.startsWith('storage:')) {
    const rawPath = trimmed.replace(/^storage:/, '');
    if (rawPath.startsWith(`${BLOG_IMAGES_BUCKET}/`)) {
      objectKey = rawPath.slice(`${BLOG_IMAGES_BUCKET}/`.length);
    }
  } else {
    // Check if it's a legacy public Supabase URL
    const match = trimmed.match(/\/storage\/v1\/object\/(?:sign|public)\/blog-images\/([^?#]+)/);
    if (match && match[1]) {
      objectKey = decodeURIComponent(match[1]);
    }
  }

  // If it's a storage object in Supabase
  if (objectKey) {
    if (isStorageReady && supabase) {
      try {
        const { data, error } = await supabase.storage
          .from(BLOG_IMAGES_BUCKET)
          .createSignedUrl(objectKey, expiresInSeconds);

        if (!error && data?.signedUrl) {
          return data.signedUrl;
        }

        console.error(
          `[STORAGE ERROR] Failed to create signed URL for '${objectKey}':`,
          error?.message
        );
      } catch (err: unknown) {
        console.error(
          `[STORAGE EXCEPTION] Error signing image '${objectKey}':`,
          err instanceof Error ? err.message : err
        );
      }
    }

    // Local dev fallback if Supabase is unavailable
    return `/uploads/blog/${objectKey}`;
  }

  // External URLs (Unsplash) or local dev paths are returned as is
  return trimmed;
}

/**
 * Attaches freshly signed URLs to an array of posts.
 * Skips posts without cover images or with external image URLs.
 */
export async function attachSignedUrlsToPosts(
  posts: BlogPost[],
  expiresInSeconds: number = SIGNED_URL_DEFAULT_EXPIRY
): Promise<BlogPost[]> {
  if (!Array.isArray(posts) || posts.length === 0) return [];

  return Promise.all(
    posts.map(async (post) => {
      if (!post.coverImage) return post;
      const signedCover = await resolveSignedCoverImage(post.coverImage, expiresInSeconds);
      return {
        ...post,
        coverImage: signedCover,
      };
    })
  );
}

/**
 * Safe Lifecycle Cleanup Utility for Abandoned Uploads.
 * Only identifies or removes storage objects that are:
 * 1. Older than `olderThanHours` (default 24h) to avoid touching active composer uploads.
 * 2. NOT referenced by any active post in the database.
 */
export async function findOrPruneOrphanedImages(options: {
  olderThanHours?: number;
  prune?: boolean;
} = {}): Promise<{
  totalObjects: number;
  activeReferences: number;
  orphanedCount: number;
  orphanedFiles: string[];
  prunedCount: number;
}> {
  const { olderThanHours = 24, prune = false } = options;
  const supabase = getSupabaseAdmin();

  if (!supabase || !isSupabaseConfigured()) {
    return {
      totalObjects: 0,
      activeReferences: 0,
      orphanedCount: 0,
      orphanedFiles: [],
      prunedCount: 0,
    };
  }

  // 1. Fetch all cover_image references from the posts table
  const { data: posts } = await supabase.from('posts').select('cover_image');
  const activeReferencedFilenames = new Set<string>();

  if (posts) {
    for (const post of posts) {
      if (post.cover_image) {
        const normalized = normalizeStoragePath(post.cover_image);
        if (normalized && normalized.startsWith(`${BLOG_IMAGES_BUCKET}/`)) {
          activeReferencedFilenames.add(normalized.slice(`${BLOG_IMAGES_BUCKET}/`.length));
        }
      }
    }
  }

  // 2. List all files in the bucket
  const { data: files, error: listErr } = await supabase.storage
    .from(BLOG_IMAGES_BUCKET)
    .list();

  if (listErr || !files) {
    throw new Error(`Failed to list storage objects: ${listErr?.message}`);
  }

  const cutoffTime = Date.now() - olderThanHours * 60 * 60 * 1000;
  const orphaned: string[] = [];

  for (const file of files) {
    const fileTime = file.created_at ? new Date(file.created_at).getTime() : 0;
    // Check if older than threshold AND not referenced in any post
    if (fileTime < cutoffTime && !activeReferencedFilenames.has(file.name)) {
      orphaned.push(file.name);
    }
  }

  let prunedCount = 0;
  if (prune && orphaned.length > 0) {
    const { data: deleted, error: delErr } = await supabase.storage
      .from(BLOG_IMAGES_BUCKET)
      .remove(orphaned);
    if (!delErr && deleted) {
      prunedCount = deleted.length;
    }
  }

  return {
    totalObjects: files.length,
    activeReferences: activeReferencedFilenames.size,
    orphanedCount: orphaned.length,
    orphanedFiles: orphaned,
    prunedCount,
  };
}
