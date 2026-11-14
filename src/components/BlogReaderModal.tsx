'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Heart,
  MessageSquare,
  Calendar,
  Clock,
  Send,
  CheckCircle2,
  Share2,
  Tag,
  Mail,
  Trash2,
} from 'lucide-react';
import { BlogPost, BlogComment } from '@/data/initialBlogs';
import { ShareButtons } from './ShareButtons';

interface BlogReaderModalProps {
  post: BlogPost | null;
  onClose: () => void;
  onLikeUpdated: (postId: string, newLikes: number) => void;
  onCommentAdded: (postId: string, newComment: BlogComment) => void;
  onCommentDeleted?: (postId: string, commentId: string) => void;
  isAuthor?: boolean;
  csrfToken?: string;
}

export function BlogReaderModal({
  post,
  onClose,
  onLikeUpdated,
  onCommentAdded,
  onCommentDeleted,
  isAuthor,
  csrfToken,
}: BlogReaderModalProps) {
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  // Comment Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState('');
  const [commentSuccess, setCommentSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

  // Sync state when post changes
  useEffect(() => {
    if (post) {
      setLikes(post.likes);
      const likedKey = `nayem_blog_liked_${post.id}`;
      const alreadyLiked = localStorage.getItem(likedKey) === 'true';
      setHasLiked(alreadyLiked);
      setCommentSuccess(false);
      setCommentError('');
    }
  }, [post]);

  // Lock body scroll and ESC listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (post) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [post, onClose]);

  if (!post) return null;

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);

    const previousLikes = likes;
    const newLikeCount = likes + 1;
    setLikes(newLikeCount);
    setHasLiked(true);
    onLikeUpdated(post.id, newLikeCount);

    try {
      const res = await fetch(`/api/blog/${post.id}/like`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success && typeof data.likes === 'number') {
        setLikes(data.likes);
        onLikeUpdated(post.id, data.likes);
        localStorage.setItem(`nayem_blog_liked_${post.id}`, 'true');
      } else {
        // Revert on failure or duplicate
        setLikes(data.likes ?? previousLikes);
        onLikeUpdated(post.id, data.likes ?? previousLikes);
        if (!data.alreadyLiked) {
          setHasLiked(false);
          localStorage.removeItem(`nayem_blog_liked_${post.id}`);
        }
      }
    } catch (err) {
      console.warn('Could not sync like to server, reverting:', err);
      setLikes(previousLikes);
      onLikeUpdated(post.id, previousLikes);
      setHasLiked(false);
      localStorage.removeItem(`nayem_blog_liked_${post.id}`);
    } finally {
      setIsLiking(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCommentError('');
    setCommentSuccess(false);

    if (!name.trim()) {
      setCommentError('Please enter your name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setCommentError('Please provide a valid email address.');
      return;
    }
    if (!commentText.trim()) {
      setCommentError('Please enter your comment.');
      return;
    }

    setIsSubmittingComment(true);

    const tempComment: BlogComment = {
      id: `comment-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      comment: commentText.trim(),
      createdAt: 'Just now',
    };

    try {
      const res = await fetch(`/api/blog/${post.id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          comment: commentText.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to post comment');
      }

      const confirmedComment = data.comment || tempComment;
      onCommentAdded(post.id, confirmedComment);
      setCommentText('');
      setCommentSuccess(true);
      setTimeout(() => setCommentSuccess(false), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error submitting comment';
      setCommentError(msg);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    setDeletingCommentId(commentId);
    try {
      const res = await fetch(
        `/api/blog/${post.id}/comment?commentId=${encodeURIComponent(commentId)}`,
        {
          method: 'DELETE',
          headers: {
            'x-csrf-token': csrfToken || '',
          },
        }
      );
      const data = await res.json();
      if (res.ok && data.success) {
        if (onCommentDeleted) {
          onCommentDeleted(post.id, commentId);
        }
      } else {
        alert(data.error || 'Failed to delete comment');
      }
    } catch {
      alert('Error connecting to server to delete comment');
    } finally {
      setDeletingCommentId(null);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.origin + '/blog');
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Helper to render markdown content with headings & code blocks
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBuffer: string[] = [];

    lines.forEach((line, index) => {
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <div
              key={`code-${index}`}
              className="my-4 p-4 rounded-xl bg-slate-950 border border-white/10 font-mono text-xs text-sky-300 overflow-x-auto shadow-inner"
            >
              <pre>{codeBuffer.join('\n')}</pre>
            </div>
          );
          codeBuffer = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        return;
      }

      if (line.startsWith('### ')) {
        elements.push(
          <h4 key={index} className="text-lg font-bold text-white mt-6 mb-2 tracking-tight">
            {line.replace('### ', '')}
          </h4>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h3 key={index} className="text-xl font-bold text-white mt-8 mb-3 tracking-tight">
            {line.replace('## ', '')}
          </h3>
        );
      } else if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ') || line.startsWith('4. ')) {
        elements.push(
          <div key={index} className="flex items-start gap-2 text-sm text-slate-300 my-1 pl-2">
            <span className="text-indigo-400 font-mono font-bold shrink-0">{line.slice(0, 3)}</span>
            <span>{line.slice(3)}</span>
          </div>
        );
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        elements.push(
          <div key={index} className="flex items-start gap-2 text-sm text-slate-300 my-1 pl-2">
            <span className="text-indigo-400 font-bold shrink-0">•</span>
            <span>{line.slice(2)}</span>
          </div>
        );
      } else if (line.trim() === '') {
        elements.push(<div key={index} className="h-3" />);
      } else {
        elements.push(
          <p key={index} className="text-sm text-slate-300 leading-relaxed my-2">
            {line}
          </p>
        );
      }
    });

    return elements;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#090d16]/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-4xl max-h-[92vh] bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-y-auto z-10 flex flex-col my-auto"
        >
          {/* Top Sticky Bar */}
          <div className="sticky top-0 bg-slate-900/95 backdrop-blur-md px-6 py-3.5 border-b border-white/10 flex items-center justify-between z-20">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-mono font-semibold">
                {post.category}
              </span>
              {post.mood && (
                <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono">
                  {post.mood}
                </span>
              )}
              <span className="text-xs font-mono text-slate-400 hidden sm:inline">
                {post.readTime}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
                title="Share Article Link"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copiedLink ? 'Copied!' : 'Share'}</span>
              </button>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                aria-label="Close Article"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Article Header & Cover */}
          {post.coverImage ? (
            <div className="relative w-full h-64 sm:h-80 overflow-hidden bg-slate-950">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
              <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="w-10 h-10 rounded-full border-2 border-indigo-500/80 object-cover shadow-lg"
                  />
                  <div>
                    <div className="text-sm font-bold text-white">{post.author.name}</div>
                    <div className="text-xs font-mono text-indigo-300">{post.author.role}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono text-slate-300 bg-slate-950/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{post.publishedAt}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-sky-400" />
                    <span>{post.readTime}</span>
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 sm:p-8 bg-gradient-to-b from-indigo-950/40 via-slate-900 to-slate-900 border-b border-white/5 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-10 h-10 rounded-full border-2 border-indigo-500/80 object-cover shadow-lg"
                />
                <div>
                  <div className="text-sm font-bold text-white">{post.author.name}</div>
                  <div className="text-xs font-mono text-indigo-300">{post.author.role}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono text-slate-300 bg-slate-950/70 px-3 py-1.5 rounded-xl border border-white/10">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{post.publishedAt}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-sky-400" />
                  <span>{post.readTime}</span>
                </span>
              </div>
            </div>
          )}

          {/* Article Main Body */}
          <div className="p-6 sm:p-10 space-y-8">
            {/* Title & Excerpt */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight mb-4">
                {post.title}
              </h1>
              <p className="text-sm sm:text-base text-indigo-200/90 font-medium leading-relaxed p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/20 italic">
                "{post.excerpt}"
              </p>
            </div>

            {/* Tags Row */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <Tag className="w-3.5 h-3.5 text-slate-400 mr-1" />
                {post.tags.map((t) => (
                  <span
                    key={t}
                    className="px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px] font-mono border border-white/5"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}

            {/* Formatted Article Content */}
            <div className="border-t border-b border-white/10 py-6 text-slate-200">
              {renderFormattedContent(post.content)}
            </div>

            {/* Interactive Likes & Engagement Bar */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/40 border border-white/10 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleLike}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs font-semibold transition-all duration-300 active:scale-95 shadow-lg ${
                    hasLiked
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-rose-500/20'
                      : 'bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 border border-white/10 hover:border-rose-500/30'
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 transition-transform ${
                      hasLiked ? 'fill-rose-500 text-rose-500 scale-110' : ''
                    }`}
                  />
                  <span>{hasLiked ? 'Liked!' : 'Like Article'}</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-900 text-white text-[11px]">
                    {likes}
                  </span>
                </button>

                <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 border border-white/5 text-slate-300 font-mono text-xs">
                  <MessageSquare className="w-4 h-4 text-sky-400" />
                  <span>{post.comments ? post.comments.length : 0} Comments</span>
                </div>
              </div>

              <div className="text-xs text-slate-400 font-mono">
                Written by <span className="text-white font-bold">{post.author.name}</span>
              </div>
            </div>

            {/* Social Share Bar */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-white/10 shadow-lg">
              <ShareButtons
                title={post.title}
                excerpt={post.excerpt}
                variant="full"
              />
            </div>

            {/* Comments & Discussion Section */}
            <div id="comments-section" className="space-y-6 pt-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    Discussion & Comments ({post.comments ? post.comments.length : 0})
                  </h3>
                </div>
                <span className="text-xs text-slate-400 font-mono">Join the conversation</span>
              </div>

              {/* Add Comment Form */}
              <form
                onSubmit={handleCommentSubmit}
                className="p-5 sm:p-6 rounded-2xl bg-slate-950/60 border border-white/10 space-y-4"
              >
                <div className="text-xs font-mono text-indigo-300 font-semibold uppercase tracking-wider">
                  Leave a Comment
                </div>

                {commentError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
                    {commentError}
                  </div>
                )}

                {commentSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Your comment has been posted successfully!</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-mono text-slate-300 font-medium">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Sadia Rahman"
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-mono text-slate-300 font-medium flex items-center justify-between">
                      <span>Your Email *</span>
                      <span className="text-[10px] text-indigo-400 font-mono">Will be shown with comment</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. sadia@example.com"
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-mono text-slate-300 font-medium">
                    Your Thoughts / Feedback *
                  </label>
                  <textarea
                    rows={3}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Share your perspective, question, or feedback on this article..."
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 leading-relaxed"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isSubmittingComment}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 active:scale-95"
                  >
                    {isSubmittingComment ? (
                      <span>Posting...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Post Comment</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Comments List */}
              <div className="space-y-3 pt-2">
                {post.comments && post.comments.length > 0 ? (
                  post.comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="p-4 rounded-xl bg-slate-950/40 border border-white/5 space-y-2 hover:border-white/10 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {/* Avatar letter badge */}
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold font-mono text-xs flex items-center justify-center uppercase shadow-sm shrink-0">
                            {comment.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white flex items-center gap-2 flex-wrap">
                              <span>{comment.name}</span>
                              <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 flex items-center gap-1">
                                <Mail className="w-3 h-3 text-indigo-400" />
                                <span>{comment.email}</span>
                              </span>
                            </div>
                            <div className="text-[10px] font-mono text-slate-500">
                              Reader • Verified Email
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono text-slate-500">
                            {comment.createdAt}
                          </span>
                          {isAuthor && (
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              disabled={deletingCommentId === comment.id}
                              className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-50"
                              title="Delete Comment (Admin)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 pl-10 leading-relaxed">
                        {comment.comment}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-8 rounded-xl bg-slate-950/30 border border-white/5 text-center text-xs text-slate-500 font-mono">
                    No comments yet. Be the first to share your thoughts!
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sticky Close Footer */}
          <div className="px-6 py-4 bg-slate-900 border-t border-white/10 flex items-center justify-between">
            <button
              onClick={handleLike}
              className="inline-flex items-center gap-1.5 text-xs font-mono text-rose-400 hover:text-rose-300 transition-colors"
            >
              <Heart className={`w-4 h-4 ${hasLiked ? 'fill-rose-500' : ''}`} />
              <span>{likes} Likes</span>
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Close Article
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
