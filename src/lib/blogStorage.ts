import fs from 'fs/promises';
import path from 'path';
import { BlogPost, BlogComment, initialBlogPosts } from '@/data/initialBlogs';

const DATA_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'blogPosts.json');

// Memory cache to ensure fast reads and fallback in serverless environments
let memoryPosts: BlogPost[] | null = null;

async function ensureFileInitialized(): Promise<BlogPost[]> {
  if (memoryPosts && memoryPosts.length > 0) {
    return memoryPosts;
  }

  try {
    const fileContent = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(fileContent);
    if (Array.isArray(parsed) && parsed.length > 0) {
      memoryPosts = parsed;
      return memoryPosts;
    }
  } catch {
    try {
      await fs.writeFile(DATA_FILE_PATH, JSON.stringify(initialBlogPosts, null, 2), 'utf-8');
    } catch (writeErr) {
      console.warn('Could not write initial blogPosts.json to disk, using in-memory fallback:', writeErr);
    }
  }

  memoryPosts = [...initialBlogPosts];
  return memoryPosts;
}

async function persistPosts(posts: BlogPost[]): Promise<void> {
  memoryPosts = posts;
  try {
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(posts, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not persist blog posts to disk, state retained in memory:', err);
  }
}

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const posts = await ensureFileInitialized();
  return posts;
}

export async function getBlogPostByIdOrSlug(idOrSlug: string): Promise<BlogPost | null> {
  const posts = await ensureFileInitialized();
  return posts.find((p) => p.id === idOrSlug || p.slug === idOrSlug) || null;
}

export async function createBlogPost(data: {
  title: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  category?: string;
  mood?: BlogPost['mood'];
  tags?: string[];
  authorName?: string;
  authorAvatar?: string;
  isPrivate?: boolean;
}): Promise<BlogPost> {
  const posts = await ensureFileInitialized();

  const id = `post-${Date.now()}`;
  const slug = data.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '') || `update-${Date.now()}`;

  // Estimate read time
  const wordCount = (data.content || '').split(/\s+/).filter(Boolean).length;
  const readMinutes = Math.max(1, Math.ceil(wordCount / 200));

  const now = new Date();
  const formattedDate = now.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

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
      name: data.authorName || 'Abdullah Nayem',
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

export async function togglePostPrivacy(id: string): Promise<{ success: boolean; isPrivate: boolean }> {
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
  const posts = await ensureFileInitialized();
  const filtered = posts.filter((p) => p.id !== id && p.slug !== id);
  if (filtered.length === posts.length) {
    return { success: false };
  }
  await persistPosts(filtered);
  return { success: true };
}

export async function toggleLikeBlogPost(id: string): Promise<{ success: boolean; likes: number }> {
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
  const posts = await ensureFileInitialized();
  const postIndex = posts.findIndex((p) => p.id === id || p.slug === id);

  if (postIndex === -1) {
    return { success: false, totalComments: 0 };
  }

  const now = new Date();
  const formattedDate = now.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const newComment: BlogComment = {
    id: `comment-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
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
