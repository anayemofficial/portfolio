import fs from 'fs/promises';
import path from 'path';
import { BlogPost, BlogComment, initialBlogPosts } from '@/data/initialBlogs';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { normalizeStoragePath, resolveSignedCoverImage } from '@/lib/imageStorage';

const DATA_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'blogPosts.json');

// Local development in-memory cache
const globalForBlog = globalThis as unknown as {
  memoryPosts?: BlogPost[] | null;
};

let memoryPosts: BlogPost[] | null = globalForBlog.memoryPosts ?? null;

// ==========================================
// LOCAL DEVELOPMENT JSON STORE ENGINE
// ==========================================
async function ensureFileInitialized(): Promise<BlogPost[]> {
  if (memoryPosts && memoryPosts.length > 0) {
    return memoryPosts;
  }

  try {
    const fileContent = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    if (fileContent && fileContent.trim().length > 0) {
      const parsed = JSON.parse(fileContent);
      if (Array.isArray(parsed)) {
        memoryPosts = parsed;
        globalForBlog.memoryPosts = memoryPosts;
        return memoryPosts;
      }
    }
  } catch (readErr) {
    console.warn('Local dev: re-initializing blogPosts.json fallback:', readErr);
    try {
      await fs.writeFile(DATA_FILE_PATH, JSON.stringify(initialBlogPosts, null, 2), 'utf-8');
    } catch {
      // Ignore
    }
  }

  memoryPosts = [...initialBlogPosts];
  globalForBlog.memoryPosts = memoryPosts;
  return memoryPosts;
}

async function persistPosts(posts: BlogPost[]): Promise<void> {
  memoryPosts = posts;
  globalForBlog.memoryPosts = memoryPosts;
  try {
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(posts, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not persist to local JSON file, in-memory retained:', err);
  }
}

// ==========================================
// DATABASE RECORD MAPPING HELPERS
// ==========================================
interface PostRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  category: BlogPost['category'];
  mood: BlogPost['mood'] | null;
  tags: string[] | null;
  author_name: string;
  author_avatar: string;
  author_role: string;
  published_at: string;
  read_time: string;
  likes_count: number;
  is_private: boolean;
  created_at: string;
  comments?: CommentRow[];
}

interface CommentRow {
  id: string;
  post_id: string;
  name: string;
  email: string;
  comment: string;
  created_at_display: string;
  created_at?: string;
}

function mapRowToBlogPost(row: PostRow): BlogPost {
  // Sort comments in descending chronological order
  const sortedComments = Array.isArray(row.comments)
    ? [...row.comments].sort((a, b) => {
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return timeB - timeA;
      })
    : [];

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt || '',
    content: row.content,
    coverImage: row.cover_image || undefined,
    category: row.category,
    mood: row.mood || undefined,
    tags: Array.isArray(row.tags) ? row.tags : [],
    author: {
      name: row.author_name || 'Abdullah Al Nayem',
      avatar: row.author_avatar || '/profile.jpg',
      role: row.author_role || 'Full-Stack Developer',
    },
    publishedAt: row.published_at,
    readTime: row.read_time,
    likes: row.likes_count || 0,
    comments: sortedComments.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      comment: c.comment,
      createdAt: c.created_at_display,
    })),
    isPrivate: Boolean(row.is_private),
  };
}

// ==========================================
// PRIMARY STORAGE OPERATIONS (POSTGRESQL + DEV FALLBACK)
// ==========================================

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const isProd = process.env.NODE_ENV === 'production';
  const supabase = getSupabaseAdmin();

  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('posts')
      .select('*, comments(*)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[DATABASE ERROR] Failed to fetch posts from Supabase:', error.message);
      if (isProd) {
        throw new Error(`Database service unavailable: ${error.message}`);
      }
    } else if (data) {
      return (data as PostRow[]).map(mapRowToBlogPost);
    }
  }

  // Production strictly forbids automatic silent fallback to local JSON file
  if (isProd) {
    throw new Error('Production database service is not configured or unavailable.');
  }

  // Local development fallback only
  return await ensureFileInitialized();
}

export async function getBlogPostByIdOrSlug(idOrSlug: string): Promise<BlogPost | null> {
  const isProd = process.env.NODE_ENV === 'production';
  const supabase = getSupabaseAdmin();

  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('posts')
      .select('*, comments(*)')
      .or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`)
      .maybeSingle();

    if (error) {
      console.error('[DATABASE ERROR] Failed to fetch post by ID/slug:', error.message);
      if (isProd) {
        throw new Error(`Database service unavailable: ${error.message}`);
      }
    } else if (data) {
      return mapRowToBlogPost(data as PostRow);
    }
  }

  if (isProd) {
    throw new Error('Production database service is not configured or unavailable.');
  }

  const posts = await ensureFileInitialized();
  return posts.find((p) => p.id === idOrSlug || p.slug === idOrSlug) || null;
}

export async function createBlogPost(data: {
  title: string;
  excerpt?: string;
  content: string;
  coverImage?: string | null;
  category?: string;
  mood?: BlogPost['mood'];
  tags?: string[];
  authorName?: string;
  authorAvatar?: string;
  isPrivate?: boolean;
}): Promise<BlogPost> {
  const isProd = process.env.NODE_ENV === 'production';
  const supabase = getSupabaseAdmin();

  const id = `post-${Date.now()}`;
  const slug = data.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '') || `update-${Date.now()}`;

  const wordCount = (data.content || '').split(/\s+/).filter(Boolean).length;
  const readMinutes = Math.max(1, Math.ceil(wordCount / 200));

  const now = new Date();
  const formattedDate = now.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  if (isSupabaseConfigured() && supabase) {
    const normalizedCover = normalizeStoragePath(data.coverImage);
    const insertPayload = {
      id,
      slug,
      title: data.title,
      excerpt: data.excerpt || (data.content.length > 140 ? data.content.slice(0, 140) + '...' : data.content),
      content: data.content,
      cover_image: normalizedCover,
      category: data.category || 'Daily Thoughts',
      mood: data.mood || null,
      tags: data.tags || [],
      author_name: data.authorName || 'Abdullah Al Nayem',
      author_avatar: data.authorAvatar || '/profile.jpg',
      author_role: 'Full-Stack Developer',
      published_at: formattedDate,
      read_time: `${readMinutes} min read`,
      likes_count: 0,
      is_private: Boolean(data.isPrivate),
    };

    const { data: inserted, error } = await supabase
      .from('posts')
      .insert(insertPayload)
      .select('*, comments(*)')
      .single();

    if (error) {
      console.error('[DATABASE ERROR] Failed to create post in Supabase:', error.message);
      throw new Error(`Database error creating post: ${error.message}`);
    }

    const post = mapRowToBlogPost(inserted as PostRow);
    post.coverImage = await resolveSignedCoverImage(post.coverImage);
    return post;
  }

  if (isProd) {
    throw new Error('Production database service is not configured or unavailable.');
  }

  // Local development fallback
  const posts = await ensureFileInitialized();
  const newPost: BlogPost = {
    id,
    slug,
    title: data.title,
    excerpt: data.excerpt || (data.content.length > 140 ? data.content.slice(0, 140) + '...' : data.content),
    content: data.content,
    coverImage:
      data.coverImage ||
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1200&auto=format&fit=crop',
    category: (data.category as BlogPost['category']) || 'Daily Thoughts',
    mood: data.mood || '💭 Thought',
    tags: data.tags && data.tags.length > 0 ? data.tags : ['Thoughts', 'Daily Log'],
    author: {
      name: data.authorName || 'Abdullah Al Nayem',
      avatar: data.authorAvatar || '/profile.jpg',
      role: 'Full-Stack Developer & AI Enthusiast',
    },
    publishedAt: formattedDate,
    readTime: `${readMinutes} min read`,
    likes: 0,
    comments: [],
    isPrivate: Boolean(data.isPrivate),
  };

  const updatedPosts = [newPost, ...posts];
  await persistPosts(updatedPosts);
  return newPost;
}

export async function updateBlogPost(
  id: string,
  data: {
    title?: string;
    excerpt?: string;
    content?: string;
    coverImage?: string | null;
    category?: BlogPost['category'];
    mood?: BlogPost['mood'] | null;
    tags?: string[];
    isPrivate?: boolean;
  }
): Promise<{ success: boolean; post?: BlogPost }> {
  const isProd = process.env.NODE_ENV === 'production';
  const supabase = getSupabaseAdmin();

  if (isSupabaseConfigured() && supabase) {
    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (data.title !== undefined) updatePayload.title = data.title;
    if (data.content !== undefined) {
      updatePayload.content = data.content;
      const wordCount = data.content.split(/\s+/).filter(Boolean).length;
      updatePayload.read_time = `${Math.max(1, Math.ceil(wordCount / 200))} min read`;
    }
    if (data.excerpt !== undefined) updatePayload.excerpt = data.excerpt;
    if (data.coverImage !== undefined) {
      updatePayload.cover_image = normalizeStoragePath(data.coverImage);
    }
    if (data.category !== undefined) updatePayload.category = data.category;
    if (data.mood !== undefined) updatePayload.mood = data.mood;
    if (data.tags !== undefined) updatePayload.tags = data.tags;
    if (data.isPrivate !== undefined) updatePayload.is_private = data.isPrivate;

    const { data: updated, error } = await supabase
      .from('posts')
      .update(updatePayload)
      .or(`id.eq.${id},slug.eq.${id}`)
      .select('*, comments(*)')
      .maybeSingle();

    if (error || !updated) {
      console.error('[DATABASE ERROR] Failed to update post in Supabase:', error?.message);
      if (isProd) {
        throw new Error(`Database error updating post: ${error?.message || 'Post not found.'}`);
      }
      return { success: false };
    }

    const post = mapRowToBlogPost(updated as PostRow);
    post.coverImage = await resolveSignedCoverImage(post.coverImage);
    return { success: true, post };
  }

  if (isProd) {
    throw new Error('Production database service is not configured or unavailable.');
  }

  const posts = await ensureFileInitialized();
  const postIndex = posts.findIndex((p) => p.id === id || p.slug === id);
  if (postIndex === -1) {
    return { success: false };
  }

  const existing = posts[postIndex];
  if (data.title !== undefined) existing.title = data.title;
  if (data.content !== undefined) {
    existing.content = data.content;
    const wordCount = data.content.split(/\s+/).filter(Boolean).length;
    existing.readTime = `${Math.max(1, Math.ceil(wordCount / 200))} min read`;
  }
  if (data.excerpt !== undefined) existing.excerpt = data.excerpt;
  if (data.coverImage !== undefined) existing.coverImage = data.coverImage || undefined;
  if (data.category !== undefined) existing.category = data.category;
  if (data.mood !== undefined) existing.mood = data.mood || undefined;
  if (data.tags !== undefined) existing.tags = data.tags;
  if (data.isPrivate !== undefined) existing.isPrivate = data.isPrivate;

  posts[postIndex] = existing;
  await persistPosts([...posts]);
  return { success: true, post: existing };
}

export async function togglePostPrivacy(id: string): Promise<{ success: boolean; isPrivate: boolean }> {
  const isProd = process.env.NODE_ENV === 'production';
  const supabase = getSupabaseAdmin();

  if (isSupabaseConfigured() && supabase) {
    // 1. Fetch current privacy state
    const { data: post, error: fetchErr } = await supabase
      .from('posts')
      .select('id, is_private')
      .or(`id.eq.${id},slug.eq.${id}`)
      .maybeSingle();

    if (fetchErr || !post) {
      if (isProd && fetchErr) {
        throw new Error(`Database error retrieving post privacy: ${fetchErr.message}`);
      }
      return { success: false, isPrivate: false };
    }

    const nextState = !post.is_private;
    const { error: updateErr } = await supabase
      .from('posts')
      .update({ is_private: nextState, updated_at: new Date().toISOString() })
      .eq('id', post.id);

    if (updateErr) {
      console.error('[DATABASE ERROR] Failed to toggle privacy in Supabase:', updateErr.message);
      if (isProd) {
        throw new Error(`Database error toggling privacy: ${updateErr.message}`);
      }
      return { success: false, isPrivate: post.is_private };
    }

    return { success: true, isPrivate: nextState };
  }

  if (isProd) {
    throw new Error('Production database service is not configured or unavailable.');
  }

  const posts = await ensureFileInitialized();
  const postIndex = posts.findIndex((p) => p.id === id || p.slug === id);

  if (postIndex === -1) {
    return { success: false, isPrivate: false };
  }

  posts[postIndex].isPrivate = !posts[postIndex].isPrivate;
  await persistPosts([...posts]);
  return { success: true, isPrivate: Boolean(posts[postIndex].isPrivate) };
}

export async function deleteBlogPost(id: string): Promise<{ success: boolean }> {
  const isProd = process.env.NODE_ENV === 'production';
  const supabase = getSupabaseAdmin();

  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase
      .from('posts')
      .delete()
      .or(`id.eq.${id},slug.eq.${id}`);

    if (error) {
      console.error('[DATABASE ERROR] Failed to delete post from Supabase:', error.message);
      if (isProd) {
        throw new Error(`Database error deleting post: ${error.message}`);
      }
      return { success: false };
    }

    return { success: true };
  }

  if (isProd) {
    throw new Error('Production database service is not configured or unavailable.');
  }

  const posts = await ensureFileInitialized();
  const filtered = posts.filter((p) => p.id !== id && p.slug !== id);
  if (filtered.length === posts.length) {
    return { success: false };
  }
  await persistPosts(filtered);
  return { success: true };
}

export async function toggleLikeBlogPost(
  id: string,
  visitorHash?: string
): Promise<{ success: boolean; likes: number; alreadyLiked?: boolean }> {
  const isProd = process.env.NODE_ENV === 'production';
  const supabase = getSupabaseAdmin();

  if (isSupabaseConfigured() && supabase) {
    // 1. Resolve canonical post ID (supports lookup by either UUID id or slug)
    const { data: post, error: getErr } = await supabase
      .from('posts')
      .select('id, likes_count')
      .or(`id.eq.${id},slug.eq.${id}`)
      .maybeSingle();

    if (getErr || !post) {
      if (isProd && getErr) {
        throw new Error(`Database error resolving post: ${getErr.message}`);
      }
      return { success: false, likes: 0 };
    }

    const canonicalPostId = post.id;

    // 2. If visitorHash is provided, invoke stored procedure increment_post_like for atomic insert & duplicate rejection
    if (visitorHash) {
      const { data: rpcData, error: rpcErr } = await supabase.rpc('increment_post_like', {
        p_post_id: canonicalPostId,
        p_visitor_hash: visitorHash,
      });

      if (rpcErr) {
        console.error('[DATABASE ERROR] increment_post_like RPC failed:', rpcErr.message);
        if (isProd) {
          throw new Error(`Database error recording like: ${rpcErr.message}`);
        }
      } else if (rpcData && rpcData.length > 0) {
        const result = rpcData[0];
        return {
          success: Boolean(result.success),
          likes: Number(result.new_likes_count),
          alreadyLiked: Boolean(result.already_liked),
        };
      }
    }

    // 3. Fallback direct counter increment when visitorHash is omitted (e.g. dev/test mode)
    const newLikes = (post.likes_count || 0) + 1;
    const { error: updateErr } = await supabase
      .from('posts')
      .update({ likes_count: newLikes, updated_at: new Date().toISOString() })
      .eq('id', canonicalPostId);

    if (updateErr) {
      console.error('[DATABASE ERROR] Like update failed:', updateErr.message);
      if (isProd) {
        throw new Error(`Database error updating like counter: ${updateErr.message}`);
      }
      return { success: false, likes: post.likes_count };
    }

    return { success: true, likes: newLikes };
  }

  if (isProd) {
    throw new Error('Production database service is not configured or unavailable.');
  }

  const posts = await ensureFileInitialized();
  const postIndex = posts.findIndex((p) => p.id === id || p.slug === id);

  if (postIndex === -1) {
    return { success: false, likes: 0 };
  }

  posts[postIndex].likes += 1;
  await persistPosts([...posts]);
  return { success: true, likes: posts[postIndex].likes };
}

export async function addCommentToBlogPost(
  id: string,
  commentData: { name: string; email: string; comment: string }
): Promise<{ success: boolean; comment?: BlogComment; totalComments: number }> {
  const isProd = process.env.NODE_ENV === 'production';
  const supabase = getSupabaseAdmin();

  const now = new Date();
  const formattedDate = now.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const commentId = `comment-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

  if (isSupabaseConfigured() && supabase) {
    // 1. Resolve canonical post ID
    const { data: post, error: findErr } = await supabase
      .from('posts')
      .select('id')
      .or(`id.eq.${id},slug.eq.${id}`)
      .maybeSingle();

    if (findErr || !post) {
      if (isProd && findErr) {
        throw new Error(`Database error finding post for comment: ${findErr.message}`);
      }
      return { success: false, totalComments: 0 };
    }

    // 2. Insert comment with foreign key link
    const { error: insertErr } = await supabase.from('comments').insert({
      id: commentId,
      post_id: post.id,
      name: commentData.name.trim(),
      email: commentData.email.trim(),
      comment: commentData.comment.trim(),
      created_at_display: formattedDate,
    });

    if (insertErr) {
      console.error('[DATABASE ERROR] Failed to insert comment in Supabase:', insertErr.message);
      throw new Error(`Database error inserting comment: ${insertErr.message}`);
    }

    // 3. Count total comments
    const { count, error: countErr } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', post.id);

    if (countErr) {
      console.warn('[DATABASE WARNING] Failed to get exact comment count:', countErr.message);
    }

    const newComment: BlogComment = {
      id: commentId,
      name: commentData.name.trim(),
      email: commentData.email.trim(),
      comment: commentData.comment.trim(),
      createdAt: formattedDate,
    };

    return {
      success: true,
      comment: newComment,
      totalComments: count || 1,
    };
  }

  if (isProd) {
    throw new Error('Production database service is not configured or unavailable.');
  }

  // Local development fallback
  const posts = await ensureFileInitialized();
  const postIndex = posts.findIndex((p) => p.id === id || p.slug === id);

  if (postIndex === -1) {
    return { success: false, totalComments: 0 };
  }

  const newComment: BlogComment = {
    id: commentId,
    name: commentData.name.trim(),
    email: commentData.email.trim(),
    comment: commentData.comment.trim(),
    createdAt: formattedDate,
  };

  if (!posts[postIndex].comments) {
    posts[postIndex].comments = [];
  }

  posts[postIndex].comments.unshift(newComment);
  await persistPosts([...posts]);

  return {
    success: true,
    comment: newComment,
    totalComments: posts[postIndex].comments.length,
  };
}

export async function deleteComment(commentId: string): Promise<{ success: boolean }> {
  const isProd = process.env.NODE_ENV === 'production';
  const supabase = getSupabaseAdmin();

  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('comments').delete().eq('id', commentId);
    if (error) {
      console.error('[DATABASE ERROR] Failed to delete comment:', error.message);
      if (isProd) {
        throw new Error(`Database error deleting comment: ${error.message}`);
      }
      return { success: false };
    }
    return { success: true };
  }

  if (isProd) {
    throw new Error('Production database service is not configured or unavailable.');
  }

  const posts = await ensureFileInitialized();
  let found = false;
  posts.forEach((p) => {
    if (p.comments) {
      const idx = p.comments.findIndex((c) => c.id === commentId);
      if (idx !== -1) {
        p.comments.splice(idx, 1);
        found = true;
      }
    }
  });

  if (found) {
    await persistPosts([...posts]);
    return { success: true };
  }
  return { success: false };
}
