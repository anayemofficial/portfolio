'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Image as ImageIcon,
  CheckCircle2,
  Send,
  Sparkles,
  Smile,
  Tag,
  Trash2,
  Globe,
  Lock,
} from 'lucide-react';
import { BlogPost, BlogCategory, BlogMood } from '@/data/initialBlogs';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: (newPost: BlogPost) => void;
}

const MOODS: BlogMood[] = [
  '💭 Thought',
  '🌍 Political & Social',
  '☕ Daily Life',
  '🚀 Building',
  '💡 Idea',
  '🏆 Milestone',
  '✨ Reflection',
  '🔥 Perspective',
];

const CATEGORIES: BlogCategory[] = [
  'Daily Life Updates',
  'Political & Social Thoughts',
  'Feelings & Reflections',
  'Tech & Code',
  'Project Updates',
  'Career & Journey',
];

export function CreatePostModal({ isOpen, onClose, onPostCreated }: CreatePostModalProps) {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<BlogCategory>('Daily Life Updates');
  const [mood, setMood] = useState<BlogMood>('☕ Daily Life');
  const [coverImage, setCoverImage] = useState<string>('');
  const [isPrivate, setIsPrivate] = useState<boolean>(false);
  const [authorAvatar, setAuthorAvatar] = useState<string>('/profile.jpg');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setErrorMessage('');
      const savedAvatar = localStorage.getItem('nayem_author_avatar');
      if (savedAvatar) {
        setAuthorAvatar(savedAvatar);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // File upload from PC (instant local FileReader preview)
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('Image size too large. Please select a photo under 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setCoverImage(reader.result);
        setErrorMessage('');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setCoverImage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!content.trim() && !coverImage) {
      setErrorMessage('Please write something or attach a photo.');
      return;
    }

    setIsSubmitting(true);

    // If user didn't enter a custom title, automatically generate one from the first sentence
    const autoTitle =
      title.trim() ||
      content.trim().split('\n')[0].slice(0, 70) ||
      `${mood} - ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

    const passcode = localStorage.getItem('nayem_author_passcode') || 'nayem2026';

    try {
      const res = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: autoTitle,
          category,
          mood,
          content: content.trim(),
          coverImage: coverImage || undefined,
          tags: [category, mood.replace(/^[^\s]+\s/, '')],
          passcode,
          isPrivate,
          authorAvatar,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to publish post');
      }

      // Reset form
      setContent('');
      setTitle('');
      setCoverImage('');
      onPostCreated(data.post);
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error publishing post';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
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

        {/* Facebook-style Card Composer */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl bg-slate-900 border border-indigo-500/30 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col my-auto"
        >
          {/* Header */}
          <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between bg-slate-900/90">
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Create Post & Daily Update</span>
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
                {errorMessage}
              </div>
            )}

            {/* Author Profile Row with Category, Mood & Privacy selectors */}
            <div className="flex items-center justify-between flex-wrap gap-2 pb-2">
              <div className="flex items-center gap-2.5">
                <img
                  src={authorAvatar}
                  alt="Abdullah Nayem"
                  className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500/60 shadow-md"
                />
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Abdullah Nayem</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      Author
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    Posting to your portfolio blog
                  </div>
                </div>
              </div>

              {/* Privacy, Category & Mood Selectors */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Privacy Selector */}
                <select
                  value={isPrivate ? 'private' : 'public'}
                  onChange={(e) => setIsPrivate(e.target.value === 'private')}
                  className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-mono focus:outline-none transition-colors ${
                    isPrivate
                      ? 'bg-amber-950/60 border-amber-500/40 text-amber-300'
                      : 'bg-slate-950 border-white/10 text-sky-300'
                  }`}
                  title="Choose who can see this post"
                >
                  <option value="public" className="bg-slate-900 text-white">🌐 Public</option>
                  <option value="private" className="bg-slate-900 text-white">🔒 Private (Only Me)</option>
                </select>

                {/* Category Selector */}
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as BlogCategory)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-white/10 text-indigo-300 text-[11px] font-mono focus:outline-none focus:border-indigo-500"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c} className="bg-slate-900 text-white">
                      {c}
                    </option>
                  ))}
                </select>

                {/* Mood Selector */}
                <select
                  value={mood}
                  onChange={(e) => setMood(e.target.value as BlogMood)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-white/10 text-emerald-300 text-[11px] font-mono focus:outline-none focus:border-indigo-500"
                >
                  {MOODS.map((m) => (
                    <option key={m} value={m} className="bg-slate-900 text-white">
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Optional Title input */}
            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Headline or Title (Optional - auto-generates if empty)"
                className="w-full px-3 py-2 rounded-xl bg-slate-950/60 border border-white/5 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Main Text Area (Facebook-style) */}
            <div>
              <textarea
                rows={5}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind today, Abdullah? Share your daily update, political thought, feeling, project milestone, or code progress..."
                className="w-full px-3 py-2 rounded-xl bg-transparent border-0 text-white placeholder-slate-500 text-sm sm:text-base focus:outline-none leading-relaxed resize-none"
                autoFocus
              />
            </div>

            {/* Photo Preview Box (If a photo is uploaded from PC) */}
            {coverImage && (
              <div className="relative rounded-xl overflow-hidden border border-white/10 max-h-64 bg-slate-950 group">
                <img
                  src={coverImage}
                  alt="Upload preview"
                  className="w-full h-full object-cover max-h-64"
                />
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-rose-600 text-white transition-colors shadow-lg"
                  title="Remove photo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Hidden Native File Input for PC Upload */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handlePhotoSelect}
              className="hidden"
            />

            {/* Bottom Action Bar: Add Photo button & Post button */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-mono transition-all ${
                  coverImage
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border-white/10'
                }`}
              >
                <ImageIcon className="w-4 h-4 text-emerald-400" />
                <span>{coverImage ? 'Change Photo' : 'Add Photo from PC'}</span>
              </button>

              <button
                type="submit"
                disabled={isSubmitting || (!content.trim() && !coverImage)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-sky-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-40 active:scale-95"
              >
                {isSubmitting ? (
                  <span>Publishing...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Post</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
