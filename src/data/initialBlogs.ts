export interface BlogComment {
  id: string;
  name: string;
  email: string;
  comment: string;
  createdAt: string;
}

export type BlogCategory =
  | 'Daily Life Updates'
  | 'Political & Social Thoughts'
  | 'Feelings & Reflections'
  | 'Tech & Code'
  | 'Project Updates'
  | 'Career & Journey';

export type BlogMood =
  | '💭 Thought'
  | '🌍 Political & Social'
  | '☕ Daily Life'
  | '🚀 Building'
  | '💡 Idea'
  | '🏆 Milestone'
  | '✨ Reflection'
  | '🔥 Perspective';

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  category: BlogCategory;
  mood?: BlogMood;
  tags: string[];
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  publishedAt: string;
  readTime: string;
  likes: number;
  comments: BlogComment[];
  isPrivate?: boolean;
}

/**
 * Initial seed blog posts. Empty in production so demo content cannot reappear.
 * Real posts will be created dynamically by the author via the UI or Supabase.
 */
export const initialBlogPosts: BlogPost[] = [];
