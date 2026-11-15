'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
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
  PenLine,
  RefreshCw,
  AlertCircle,
  Edit3,
} from 'lucide-react';
import { BlogPost, BlogComment } from '@/data/initialBlogs';
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
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeReaderPost, setActiveReaderPost] = useState<BlogPost | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});

  // Author Mode state: only Abdullah Al Nayem can publish or delete
  const [isAuthor, setIsAuthor] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string>('');
  const [showAuthorLoginModal, setShowAuthorLoginModal] = useState(false);
  const [authorPasswordInput, setAuthorPasswordInput] = useState('');
  const [authorLoginError, setAuthorLoginError] = useState('');

  // Blog Cover Photo
  const [coverPhoto, setCoverPhoto] = useState<string>('/blog-cover.jpg');

  // Author Profile Photo
  const [profilePhoto, setProfilePhoto] = useState<string>('/profile.jpg');

  useEffect(() => {
    // Purge any legacy demo posts cache from localStorage to guarantee authoritative PostgreSQL data
    try {
      localStorage.removeItem('nayem_blog_posts_cache');
    } catch {
      // Ignore
    }

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

    try {
      const res = await fetch('/api/blog', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({ id: postId, action: 'togglePrivacy' }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        // Revert on failure
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, isPrivate: !p.isPrivate } : p))
        );
        alert(data.error || 'Failed to update post privacy');
      }
    } catch (err) {
      console.warn('Privacy toggle server sync error:', err);
      // Revert on network error
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, isPrivate: !p.isPrivate } : p))
      );
    }
  };

  const fetchPosts = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const res = await fetch('/api/blog');
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.posts)) {
        setPosts(data.posts);
      } else {
        setFetchError(data.error || 'Failed to retrieve posts from server.');
      }
    } catch (err) {
      console.warn('Could not fetch blog posts from API:', err);
      setFetchError('Unable to connect to blog service. Please check your connection and retry.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load posts & verify author session
  useEffect(() => {
    const checkAuthorSession = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        setIsAuthor(Boolean(data.authenticated));
        if (data.csrfToken) {
          setCsrfToken(data.csrfToken);
        }
      } catch {
        setIsAuthor(false);
      }
    };

    checkAuthorSession();
    fetchPosts();
  }, []);

  // Update liked posts map when posts load
  useEffect(() => {
    const initialLiked: Record<string, boolean> = {};
    posts.forEach((p) => {
      if (localStorage.getItem(`nayem_blog_liked_${p.id}`) === 'true') {
        initialLiked[p.id] = true;
      }
    });
    setLikedPosts(initialLiked);
  }, [posts]);

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
    setPosts((prev) => [newPost, ...prev]);
    setSelectedCategory('All');
    setSearchQuery('');
  };

  const handleEditPost = (post: BlogPost) => {
    setEditingPost(post);
    setIsCreateModalOpen(true);
  };

  const handlePostUpdated = (updatedPost: BlogPost) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === updatedPost.id ? updatedPost : p))
    );
    if (activeReaderPost && activeReaderPost.id === updatedPost.id) {
      setActiveReaderPost(updatedPost);
    }
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

  const handleCommentDeleted = (postId: string, commentId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            comments: (p.comments || []).filter((c) => c.id !== commentId),
          };
        }
        return p;
      })
    );
    if (activeReaderPost && activeReaderPost.id === postId) {
      setActiveReaderPost((prev) =>
        prev
          ? {
              ...prev,
              comments: (prev.comments || []).filter((c) => c.id !== commentId),
            }
          : null
      );
    }
  };

  const handleQuickLike = async (e: React.MouseEvent, post: BlogPost) => {
    e.stopPropagation();
    const previousLikes = post.likes;
    const optimisticLikes = post.likes + 1;
    handleLikeUpdated(post.id, optimisticLikes);
    setLikedPosts((prev) => ({ ...prev, [post.id]: true }));

    try {
      const res = await fetch(`/api/blog/${post.id}/like`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success && typeof data.likes === 'number') {
        handleLikeUpdated(post.id, data.likes);
        localStorage.setItem(`nayem_blog_liked_${post.id}`, 'true');
      } else {
        // Revert on server error or duplicate like
        handleLikeUpdated(post.id, data.likes ?? previousLikes);
        if (!data.alreadyLiked) {
          setLikedPosts((prev) => {
            const next = { ...prev };
            delete next[post.id];
            return next;
          });
        }
      }
    } catch (err) {
      console.warn('Quick like server sync failed:', err);
      // Revert on network failure
      handleLikeUpdated(post.id, previousLikes);
      setLikedPosts((prev) => {
        const next = { ...prev };
        delete next[post.id];
        return next;
      });
    }
  };

  const handleDeletePost = async (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      const res = await fetch(`/api/blog?id=${encodeURIComponent(postId)}`, {
        method: 'DELETE',
        headers: {
          'x-csrf-token': csrfToken,
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
        if (activeReaderPost && activeReaderPost.id === postId) {
          setActiveReaderPost(null);
        }
      } else {
        alert(data.error || 'Failed to delete post');
      }
    } catch {
      alert('Error connecting to server to delete post');
    }
  };

  const handleAuthorLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorPasswordInput.trim()) {
      setAuthorLoginError('Please enter the author passcode.');
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: authorPasswordInput.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthor(true);
        if (data.csrfToken) {
          setCsrfToken(data.csrfToken);
        }
        setShowAuthorLoginModal(false);
        setAuthorPasswordInput('');
        setAuthorLoginError('');
        setIsCreateModalOpen(true);
        fetchPosts(); // Reload to include private posts
      } else {
        setAuthorLoginError(data.error || 'Incorrect passcode. Access denied.');
      }
    } catch {
      setAuthorLoginError('Connection error. Failed to reach auth service.');
    }
  };

  const handleAuthorLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch {
      // Ignore
    }
    setIsAuthor(false);
    setCsrfToken('');
    fetchPosts(); // Re-fetch to filter out private posts
  };

  return (
    <section className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 font-sans">
      {/* 1. HERO COVER BANNER */}
      <div className="relative w-full h-48 sm:h-72 md:h-80 rounded-3xl overflow-hidden glass-card border border-white/10 shadow-2xl group">
        <Image
          src={coverPhoto}
          alt="Abdullah Al Nayem Blog Cover Banner"
          fill
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1024px"
          unoptimized={coverPhoto.startsWith('data:')}
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090d16] via-[#090d16]/40 to-transparent" />

        {isAuthor && (
          <label className="absolute bottom-4 right-4 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white text-xs font-mono border border-white/20 backdrop-blur-md cursor-pointer transition-all shadow-lg active:scale-95">
            <Camera className="w-4 h-4 text-indigo-400" />
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

      {/* 2. PROFILE HEADER & AUTHOR BAR */}
      <div className="relative px-4 sm:px-8 -mt-16 sm:-mt-20 mb-8 z-10">
        <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
            <div className="relative group/avatar">
              <img
                src={profilePhoto}
                alt="Abdullah Al Nayem"
                className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover border-4 border-[#090d16] shadow-2xl ring-2 ring-indigo-500/50 bg-slate-900"
              />
              <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-[#090d16] shadow-md" />

              {isAuthor && (
                <label className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-white opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="w-6 h-6" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePhotoChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Abdullah Al Nayem
                </h1>
                <CheckCircle2 className="w-5 h-5 text-sky-400 fill-sky-400/20" />
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-mono font-medium">
                  Author
                </span>
              </div>
              <p className="text-sm text-slate-400 max-w-lg leading-relaxed">
                Full-Stack Developer & AI Systems Builder • Sharing daily thoughts, tech notes, and life updates.
              </p>
            </div>
          </div>

          {/* Author Mode Controls */}
          <div className="flex items-center gap-2">
            {isAuthor ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-white font-medium text-xs sm:text-sm transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Write Thought</span>
                </button>
                <button
                  onClick={handleAuthorLogout}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
                  title="Lock Author Mode"
                >
                  <Unlock className="w-4 h-4 text-emerald-400" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthorLoginModal(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/10 text-xs font-mono transition-all"
                title="Only Abdullah Al Nayem can write or manage posts"
              >
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Author Unlock</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. POST FEED & COMPOSER CONTAINER */}
      <div className="space-y-6">
        {/* Quick Post Prompt (Facebook Style) */}
        <div
          onClick={() => {
            if (isAuthor) {
              setIsCreateModalOpen(true);
            } else {
              setShowAuthorLoginModal(true);
            }
          }}
          className="p-4 rounded-2xl glass-card border border-white/10 bg-slate-900/80 shadow-xl flex items-center gap-3 cursor-pointer group hover:border-indigo-500/40 transition-all"
        >
          <img
            src={profilePhoto}
            alt="Author avatar"
            className="w-10 h-10 rounded-full object-cover border border-indigo-500/40"
          />
          <div className="flex-1 px-4 py-2.5 rounded-full bg-slate-950/80 border border-white/10 text-slate-400 text-xs sm:text-sm font-medium flex items-center justify-between group-hover:text-slate-200 transition-colors">
            <span>What's on your mind today, Nayem?</span>
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <button
            type="button"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-mono group-hover:bg-indigo-600 group-hover:text-white transition-colors"
          >
            <ImageIcon className="w-4 h-4" />
            <span>Photo</span>
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

        {/* FEED CONTENT STATES: Loading / Error / Empty / Posts */}
        {isLoading ? (
          /* SKELETON LOADING STATE */
          <div className="space-y-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="rounded-2xl glass-card border border-white/10 p-6 space-y-4 bg-slate-900/60 animate-pulse"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-slate-800" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-4 bg-slate-800 rounded w-1/4" />
                    <div className="h-3 bg-slate-800/60 rounded w-1/3" />
                  </div>
                </div>
                <div className="h-5 bg-slate-800 rounded w-3/4" />
                <div className="h-16 bg-slate-800/40 rounded w-full" />
              </div>
            ))}
          </div>
        ) : fetchError ? (
          /* ERROR STATE & RETRY */
          <div className="p-12 rounded-2xl glass-card border border-rose-500/20 text-center space-y-4 bg-rose-950/10">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">Connection Error</h4>
            <p className="text-xs text-rose-300 max-w-md mx-auto">{fetchError}</p>
            <button
              onClick={fetchPosts}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono transition-colors shadow-lg shadow-indigo-600/30"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Connection</span>
            </button>
          </div>
        ) : filteredPosts.length > 0 ? (
          /* POPULATED POST FEED */
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

                    <div className="flex items-center gap-1">
                      {isAuthor && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditPost(post);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-sky-400 hover:bg-sky-500/10 transition-colors"
                            title="Edit Post (Author Only)"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => handleDeletePost(e, post.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Delete Post (Author Only)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <span className="px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[10px] font-mono uppercase tracking-wider">
                        {post.category}
                      </span>
                    </div>
                  </div>

                  {/* 2. Post Title & Excerpt */}
                  <div
                    onClick={() => setActiveReaderPost(post)}
                    className="p-4 sm:p-5 space-y-3 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      {post.mood && (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-mono">
                          {post.mood}
                        </span>
                      )}
                      <h2 className="text-lg sm:text-xl font-bold text-white hover:text-indigo-300 transition-colors tracking-tight">
                        {post.title}
                      </h2>
                    </div>

                    <p className="text-sm text-slate-300 leading-relaxed line-clamp-3">
                      {post.excerpt || post.content.slice(0, 180) + '...'}
                    </p>

                    {/* Tag Pills */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[11px] font-mono text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded border border-white/5"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 3. Post Cover Image (if available) */}
                  {post.coverImage && (
                    <div
                      onClick={() => setActiveReaderPost(post)}
                      className="w-full max-h-96 overflow-hidden bg-slate-950 cursor-pointer border-t border-b border-white/5"
                    >
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover hover:scale-102 transition-transform duration-500"
                      />
                    </div>
                  )}

                  {/* 4. Engagement Counts Header */}
                  <div className="px-4 py-2 text-xs font-mono text-slate-400 flex items-center justify-between border-b border-white/5 bg-slate-950/40">
                    <span className="flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                      <span>{post.likes} Likes</span>
                    </span>
                    <span className="hover:underline cursor-pointer" onClick={() => setActiveReaderPost(post)}>
                      {post.comments ? post.comments.length : 0} Comments
                    </span>
                  </div>

                  {/* 5. Facebook-Style Action Buttons */}
                  <div className="p-1 sm:p-2 bg-slate-950/20 grid grid-cols-3 gap-1 text-xs font-mono font-medium">
                    <button
                      onClick={(e) => handleQuickLike(e, post)}
                      className={`py-2 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 ${
                        isLiked
                          ? 'text-rose-400 bg-rose-500/10 font-bold'
                          : 'text-slate-400 hover:text-rose-400 hover:bg-slate-800/80'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                      <span>{isLiked ? 'Liked' : 'Like'}</span>
                    </button>

                    <button
                      onClick={() => setActiveReaderPost(post)}
                      className="py-2 rounded-xl text-slate-400 hover:text-sky-400 hover:bg-slate-800/80 flex items-center justify-center gap-2 transition-all"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Comment</span>
                    </button>

                    <div className="py-2 rounded-xl flex items-center justify-center">
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
        ) : posts.length === 0 ? (
          /* EMPTY STATE (0 POSTS IN DATABASE) */
          <div className="p-12 sm:p-16 rounded-2xl glass-card border border-white/10 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
              <PenLine className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-bold text-white">No Blog Posts Yet</h4>
            <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
              Welcome to the blog! Fresh updates, engineering insights, and daily thoughts will appear here once published.
            </p>
            {isAuthor && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Create Your First Post</span>
              </button>
            )}
          </div>
        ) : (
          /* FILTER MISMATCH STATE */
          <div className="p-12 rounded-2xl glass-card border border-white/10 text-center space-y-3">
            <Filter className="w-8 h-8 text-slate-600 mx-auto" />
            <h4 className="text-base font-bold text-white">No Posts Match Filter</h4>
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
        onCommentDeleted={handleCommentDeleted}
        isAuthor={isAuthor}
        csrfToken={csrfToken}
      />

      {/* Create / Edit Post Modal */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingPost(null);
        }}
        onPostCreated={handlePostCreated}
        onPostUpdated={handlePostUpdated}
        postToEdit={editingPost}
        csrfToken={csrfToken}
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
                    <p className="text-[11px] text-slate-400 font-mono">Only Abdullah Al Nayem can publish</p>
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
    </section>
  );
}
