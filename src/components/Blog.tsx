'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Plus,
  Search,
  Heart,
  MessageSquare,
  Calendar,
  Clock,
  ArrowRight,
  Filter,
  Lock,
  Unlock,
  Trash2,
  Coffee,
  CheckCircle2,
  Image as ImageIcon,
  ArrowLeft,
  Home as HomeIcon,
  Camera,
  Globe,
  Send,
} from 'lucide-react';
import { BlogPost, BlogComment, initialBlogPosts } from '@/data/initialBlogs';
import { BlogReaderModal } from './BlogReaderModal';
import { CreatePostModal } from './CreatePostModal';
import { ShareButtons } from './ShareButtons';

const CATEGORIES = [
  'All',
  'Daily Life Updates',
  'Political & Social Thoughts',
  'Feelings & Reflections',
  'Tech & Code',
  'Project Updates',
  'Career & Journey',
] as const;

export function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>(initialBlogPosts);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeReaderPost, setActiveReaderPost] = useState<BlogPost | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});

  // Author Mode state: only Abdullah Nayem can publish or delete
  const [isAuthor, setIsAuthor] = useState(false);
  const [showAuthorLoginModal, setShowAuthorLoginModal] = useState(false);
  const [authorPasswordInput, setAuthorPasswordInput] = useState('');
  const [authorLoginError, setAuthorLoginError] = useState('');

  // Blog Cover Photo
  const [coverPhoto, setCoverPhoto] = useState<string>('/blog-cover.jpg');

  // Author Profile Photo
  const [profilePhoto, setProfilePhoto] = useState<string>('/profile.jpg');

  useEffect(() => {
    const savedCover = localStorage.getItem('nayem_blog_cover');
    if (savedCover) {
      setCoverPhoto(savedCover);
    }
    const savedAvatar = localStorage.getItem('nayem_author_avatar');
    if (savedAvatar) {
      setProfilePhoto(savedAvatar);
    }
  }, []);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setCoverPhoto(reader.result);
          try {
            localStorage.setItem('nayem_blog_cover', reader.result);
          } catch {
            // LocalStorage quota handling
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setProfilePhoto(reader.result);
          try {
            localStorage.setItem('nayem_author_avatar', reader.result);
          } catch {
            // LocalStorage quota handling
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTogglePrivacy = async (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    // Optimistic local update
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, isPrivate: !p.isPrivate } : p))
    );

    const passcode = localStorage.getItem('nayem_author_passcode') || 'nayem2026';
    try {
      await fetch('/api/blog', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: postId, passcode, action: 'togglePrivacy' }),
      });
    } catch (err) {
      console.warn('Privacy toggle server sync error:', err);
    }
  };

  // Load posts & verify author session
  useEffect(() => {
    // Check if Abdullah Nayem is already logged into author mode on this device
    const authenticated = localStorage.getItem('nayem_author_authenticated') === 'true';
    if (authenticated) {
      setIsAuthor(true);
    }

    const fetchPosts = async () => {
      try {
        const res = await fetch('/api/blog');
        const data = await res.json();
        if (data.success && Array.isArray(data.posts) && data.posts.length > 0) {
          setPosts(data.posts);
          localStorage.setItem('nayem_blog_posts_cache', JSON.stringify(data.posts));
        } else {
          const cached = localStorage.getItem('nayem_blog_posts_cache');
          if (cached) {
            setPosts(JSON.parse(cached));
          }
        }
      } catch (err) {
        console.warn('Could not fetch remote blog posts, using cache:', err);
        const cached = localStorage.getItem('nayem_blog_posts_cache');
        if (cached) {
          setPosts(JSON.parse(cached));
        }
      }
    };

    fetchPosts();

    // Check which posts viewer has liked
    const initialLiked: Record<string, boolean> = {};
    posts.forEach((p) => {
      if (localStorage.getItem(`nayem_blog_liked_${p.id}`) === 'true') {
        initialLiked[p.id] = true;
      }
    });
    setLikedPosts(initialLiked);
  }, []);

  // Filter posts (Private posts are hidden from non-author visitors)
  const filteredPosts = posts.filter((post) => {
    // Hide private posts from visitors who are not logged in as author
    if (post.isPrivate && !isAuthor) {
      return false;
    }

    const matchesCategory =
      selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const handlePostCreated = (newPost: BlogPost) => {
    const updated = [newPost, ...posts];
    setPosts(updated);
    localStorage.setItem('nayem_blog_posts_cache', JSON.stringify(updated));
    setSelectedCategory('All');
    setSearchQuery('');
  };

  const handleLikeUpdated = (postId: string, newLikes: number) => {
    setLikedPosts((prev) => ({ ...prev, [postId]: true }));
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, likes: newLikes } : p))
    );
    if (activeReaderPost && activeReaderPost.id === postId) {
      setActiveReaderPost((prev) => (prev ? { ...prev, likes: newLikes } : null));
    }
  };

  const handleCommentAdded = (postId: string, newComment: BlogComment) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const updatedComments = [newComment, ...(p.comments || [])];
          return { ...p, comments: updatedComments };
        }
        return p;
      })
    );
    if (activeReaderPost && activeReaderPost.id === postId) {
      setActiveReaderPost((prev) =>
        prev
          ? {
              ...prev,
              comments: [newComment, ...(prev.comments || [])],
            }
          : null
      );
    }
  };

  const handleQuickLike = async (e: React.MouseEvent, post: BlogPost) => {
    e.stopPropagation();
    const newLikes = post.likes + 1;
    handleLikeUpdated(post.id, newLikes);
    localStorage.setItem(`nayem_blog_liked_${post.id}`, 'true');

    try {
      await fetch(`/api/blog/${post.id}/like`, { method: 'POST' });
    } catch (err) {
      console.warn('Quick like server sync failed:', err);
    }
  };

  const handleDeletePost = async (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    const passcode = localStorage.getItem('nayem_author_passcode') || 'nayem2026';
    try {
      const res = await fetch(`/api/blog?id=${postId}&passcode=${passcode}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        const updated = posts.filter((p) => p.id !== postId);
        setPosts(updated);
        localStorage.setItem('nayem_blog_posts_cache', JSON.stringify(updated));
      } else {
        alert(data.error || 'Failed to delete post');
      }
    } catch {
      alert('Error connecting to server to delete post');
    }
  };

  const handleAuthorLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (authorPasswordInput.trim() === 'nayem2026') {
      setIsAuthor(true);
      localStorage.setItem('nayem_author_authenticated', 'true');
      localStorage.setItem('nayem_author_passcode', 'nayem2026');
      setShowAuthorLoginModal(false);
      setAuthorPasswordInput('');
      setAuthorLoginError('');
      setIsCreateModalOpen(true);
    } else {
      setAuthorLoginError('Incorrect passcode. Enter nayem2026 to post.');
    }
  };

  const handleAuthorLogout = () => {
    setIsAuthor(false);
    localStorage.removeItem('nayem_author_authenticated');
    localStorage.removeItem('nayem_author_passcode');
  };

  return (
    <section id="blog" className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 relative bg-slate-950/40 border-y border-white/5">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Cover Photo & Personal Journal Header */}
        <div className="relative rounded-3xl overflow-hidden glass-card border border-white/10 shadow-2xl">
          {/* Cover Photo Banner */}
          <div className="relative h-48 sm:h-64 md:h-80 w-full overflow-hidden bg-slate-950">
            <img
              src={coverPhoto}
              alt="Abdullah Nayem Blog Cover"
              className="w-full h-full object-cover object-center"
            />
            {/* Cinematic Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#090d16] via-[#090d16]/35 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#090d16]/60 via-transparent to-transparent" />

            {/* Author Change Cover Button */}
            {isAuthor && (
              <label className="absolute top-4 right-4 cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-white border border-white/20 text-xs font-mono transition-all backdrop-blur-md shadow-lg hover:scale-105 active:scale-95">
                <Camera className="w-3.5 h-3.5 text-indigo-400" />
                <span>Change Cover</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Profile & Journal Identity Row */}
          <div className="px-6 sm:px-10 pb-8 pt-0 relative -mt-16 sm:-mt-20 flex flex-col md:flex-row md:items-end justify-between gap-6 z-10">
            {/* Avatar & Bio */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
              <div className="relative group shrink-0">
                <img
                  src={profilePhoto}
                  alt="Abdullah Nayem"
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl object-cover border-4 border-[#090d16] shadow-2xl ring-2 ring-indigo-500/50 bg-slate-900"
                />
                {isAuthor ? (
                  <label
                    className="absolute -bottom-1 -right-1 cursor-pointer p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white border-2 border-[#090d16] shadow-xl transition-all hover:scale-110 active:scale-95"
                    title="Change Profile Photo"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePhotoChange}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-[#090d16] flex items-center justify-center text-white text-[10px] font-bold shadow-md"
                    title="Author Active"
                  >
                    ✓
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    Abdullah Nayem
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-mono font-medium">
                    Personal Journal
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-mono text-indigo-300">
                  Software Engineer • Full-Stack Developer • Data Science & AI
                </p>
                <p className="text-xs text-slate-400 max-w-xl leading-relaxed pt-1">
                  Daily developer updates, feelings, social & political thoughts, and lessons from building scalable digital products.
                </p>
              </div>
            </div>

            {/* Post Thought Action Buttons */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => {
                  if (isAuthor) {
                    setIsCreateModalOpen(true);
                  } else {
                    setShowAuthorLoginModal(true);
                  }
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-sky-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all hover:shadow-indigo-600/50 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Post Daily Thought / Update</span>
              </button>

              {isAuthor && (
                <button
                  onClick={handleAuthorLogout}
                  className="px-3 py-2 text-xs font-mono text-slate-400 hover:text-rose-400 rounded-xl bg-slate-900 border border-white/5 transition-colors"
                  title="Exit Author Mode"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Single Column Feed Area (1 by 1, Facebook Profile Timeline Style) */}
        <div className="max-w-3xl mx-auto space-y-6 w-full">
          {/* Facebook-style Quick Composer Bar */}
          <div
            onClick={() => {
              if (isAuthor) {
                setIsCreateModalOpen(true);
              } else {
                setShowAuthorLoginModal(true);
              }
            }}
            className="p-4 rounded-2xl glass-card border border-white/10 hover:border-indigo-500/40 cursor-pointer transition-all flex items-center justify-between gap-3 sm:gap-4 group shadow-xl bg-slate-900/80"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <img
                src={profilePhoto}
                alt="Abdullah Nayem"
                className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500/60 shrink-0 shadow-md"
              />
              <div className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950/80 text-slate-400 text-xs sm:text-sm font-sans border border-white/5 group-hover:border-indigo-500/30 transition-colors truncate">
                What's on your mind today, Abdullah? Share a thought, feeling, or photo...
              </div>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-emerald-400 text-xs font-mono group-hover:bg-indigo-600 group-hover:text-white transition-all shrink-0"
            >
              <ImageIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Photo</span>
            </button>
          </div>

          {/* Filter Bar & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl glass-card border border-white/10 bg-slate-900/60">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all ${
                    selectedCategory === category
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-400/40'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search thoughts..."
                className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-950/80 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* Facebook-style 1-by-1 Post Feed */}
          {filteredPosts.length > 0 ? (
            <div className="space-y-6">
              {filteredPosts.map((post, idx) => {
                const isLiked = likedPosts[post.id];
                return (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                    className="rounded-2xl glass-card border border-white/10 overflow-hidden shadow-2xl hover:border-indigo-500/30 transition-all bg-slate-900/90"
                  >
                    {/* 1. Facebook-style Author Post Header */}
                    <div className="p-4 sm:p-5 flex items-start justify-between gap-3 border-b border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={post.author.avatar || profilePhoto || '/profile.jpg'}
                            alt={post.author.name}
                            className="w-11 h-11 rounded-full object-cover border-2 border-indigo-500/60 shadow-md"
                          />
                          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900" />
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              onClick={() => setActiveReaderPost(post)}
                              className="font-bold text-white text-sm hover:underline cursor-pointer"
                            >
                              {post.author.name}
                            </span>
                            <span className="text-slate-400 text-xs font-mono">
                              • {post.author.role}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 mt-0.5 flex-wrap">
                            <span>{post.publishedAt}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-slate-400">
                              <Clock className="w-3 h-3 text-sky-400" />
                              <span>{post.readTime}</span>
                            </span>
                            <span>•</span>
                            {isAuthor ? (
                              <button
                                onClick={(e) => handleTogglePrivacy(e, post.id)}
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono border transition-all hover:scale-105 active:scale-95 ${
                                  post.isPrivate
                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30 font-semibold'
                                    : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/20'
                                }`}
                                title="Click to toggle Public / Private"
                              >
                                {post.isPrivate ? (
                                  <>
                                    <Lock className="w-3 h-3 text-amber-400" />
                                    <span>Private (Only Me)</span>
                                  </>
                                ) : (
                                  <>
                                    <Globe className="w-3 h-3 text-indigo-400" />
                                    <span>Public</span>
                                  </>
                                )}
                              </button>
                            ) : (
                              <span className="flex items-center gap-1 text-indigo-300">
                                <Globe className="w-3 h-3 text-indigo-400" />
                                <span>Public</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-xs font-mono font-medium">
                          {post.category}
                        </span>
                        {post.mood && (
                          <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[11px] font-mono">
                            {post.mood}
                          </span>
                        )}
                        {isAuthor && (
                          <button
                            onClick={(e) => handleDeletePost(e, post.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors ml-1"
                            title="Delete Post (Author only)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* 2. Post Title & Text Content */}
                    <div className="px-4 sm:px-6 py-4 space-y-3">
                      <h3
                        onClick={() => setActiveReaderPost(post)}
                        className="text-lg sm:text-xl font-bold text-white hover:text-indigo-300 cursor-pointer transition-colors leading-snug"
                      >
                        {post.title}
                      </h3>

                      <p
                        onClick={() => setActiveReaderPost(post)}
                        className="text-sm text-slate-300 leading-relaxed font-sans whitespace-pre-line cursor-pointer"
                      >
                        {post.excerpt}
                      </p>

                      {/* Tags */}
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {post.tags.map((t) => (
                            <span
                              key={t}
                              className="text-indigo-400 hover:text-indigo-300 text-xs font-mono cursor-pointer"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 3. Post Image (Full natural width like Facebook photo post) */}
                    {post.coverImage && (
                      <div
                        onClick={() => setActiveReaderPost(post)}
                        className="relative w-full overflow-hidden bg-slate-950 cursor-pointer max-h-[520px] flex items-center justify-center border-y border-white/5"
                      >
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="w-full h-auto max-h-[520px] object-cover hover:scale-[1.01] transition-transform duration-300"
                        />
                      </div>
                    )}

                    {/* 4. Reaction Counters Row */}
                    <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between text-xs text-slate-400 font-mono border-b border-white/5">
                      <div className="flex items-center gap-1.5">
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px]">
                          ❤️
                        </span>
                        <span>{post.likes} Likes</span>
                      </div>

                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => setActiveReaderPost(post)}
                          className="hover:underline hover:text-slate-300 transition-colors"
                        >
                          {post.comments ? post.comments.length : 0} Comments
                        </button>
                      </div>
                    </div>

                    {/* 5. Facebook-style Action Bar: Like, Comment, Share */}
                    <div className="px-2 sm:px-4 py-1.5 grid grid-cols-3 gap-1 text-slate-300 text-xs sm:text-sm font-semibold">
                      {/* Like Button */}
                      <button
                        onClick={(e) => handleQuickLike(e, post)}
                        className={`flex items-center justify-center gap-2 py-2 rounded-xl hover:bg-slate-800/80 transition-all active:scale-95 ${
                          isLiked ? 'text-rose-400 font-bold' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Heart
                          className={`w-4 h-4 transition-transform ${
                            isLiked ? 'fill-rose-500 text-rose-500 scale-110' : ''
                          }`}
                        />
                        <span>Like</span>
                      </button>

                      {/* Comment Button */}
                      <button
                        onClick={() => setActiveReaderPost(post)}
                        className="flex items-center justify-center gap-2 py-2 rounded-xl hover:bg-slate-800/80 text-slate-400 hover:text-white transition-all active:scale-95"
                      >
                        <MessageSquare className="w-4 h-4 text-sky-400" />
                        <span>Comment</span>
                      </button>

                      {/* Share Action Button */}
                      <div className="flex items-center justify-center">
                        <ShareButtons variant="button" title={post.title} excerpt={post.excerpt} />
                      </div>
                    </div>

                    {/* 6. Quick Comment Prompt Row */}
                    <div
                      onClick={() => setActiveReaderPost(post)}
                      className="p-3 sm:p-4 bg-slate-950/60 border-t border-white/5 flex items-center gap-3 cursor-pointer group"
                    >
                      <img
                        src={profilePhoto}
                        alt="User avatar"
                        className="w-8 h-8 rounded-full object-cover border border-white/10 shrink-0"
                      />
                      <div className="flex-1 px-3.5 py-1.5 rounded-full bg-slate-900 border border-white/10 text-slate-500 text-xs flex items-center justify-between group-hover:border-indigo-500/30 transition-colors">
                        <span>Write a comment or thought...</span>
                        <Send className="w-3.5 h-3.5 text-indigo-400 opacity-60 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          ) : (
            <div className="p-12 rounded-2xl glass-card border border-white/10 text-center space-y-3">
              <Filter className="w-8 h-8 text-slate-600 mx-auto" />
              <h4 className="text-base font-bold text-white">No Posts Found</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No updates match the current filter or search criteria.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-mono text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>

        {/* Reader Modal */}
        <BlogReaderModal
          post={activeReaderPost}
          onClose={() => setActiveReaderPost(null)}
          onLikeUpdated={handleLikeUpdated}
          onCommentAdded={handleCommentAdded}
        />

        {/* Create Post Modal */}
        <CreatePostModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onPostCreated={handlePostCreated}
        />

        {/* Author Access / Login Modal */}
        <AnimatePresence>
          {showAuthorLoginModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowAuthorLoginModal(false)}
                className="fixed inset-0 bg-[#090d16]/85 backdrop-blur-md"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-md bg-slate-900 border border-indigo-500/30 p-6 rounded-2xl shadow-2xl z-10 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Author Space Unlock</h4>
                      <p className="text-[11px] text-slate-400 font-mono">Only Abdullah Nayem can publish</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAuthorLoginModal(false)}
                    className="text-slate-400 hover:text-white text-xs font-mono"
                  >
                    Close
                  </button>
                </div>

                <form onSubmit={handleAuthorLogin} className="space-y-4">
                  {authorLoginError && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
                      {authorLoginError}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono text-slate-300">
                      Enter Author Passcode
                    </label>
                    <input
                      type="password"
                      value={authorPasswordInput}
                      onChange={(e) => setAuthorPasswordInput(e.target.value)}
                      placeholder="Passcode..."
                      autoFocus
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAuthorLoginModal(false)}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-mono"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
                    >
                      Unlock Author Mode
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
