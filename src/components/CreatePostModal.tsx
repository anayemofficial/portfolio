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
  Edit3,
} from 'lucide-react';
import { BlogPost, BlogCategory, BlogMood } from '@/data/initialBlogs';
import { optimizeImageForUpload } from '@/lib/imageOptimization';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated?: (newPost: BlogPost) => void;
  onPostUpdated?: (updatedPost: BlogPost) => void;
  postToEdit?: BlogPost | null;
  csrfToken?: string;
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

export function CreatePostModal({
  isOpen,
  onClose,
  onPostCreated,
  onPostUpdated,
  postToEdit,
  csrfToken,
}: CreatePostModalProps) {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<BlogCategory>('Daily Life Updates');
  const [mood, setMood] = useState<BlogMood>('☕ Daily Life');
  const [coverImage, setCoverImage] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [isPrivate, setIsPrivate] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [authorAvatar, setAuthorAvatar] = useState('/profile.jpg');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditMode = Boolean(postToEdit);

  useEffect(() => {
    const saved = localStorage.getItem('nayem_author_avatar');
    if (saved) {
      setAuthorAvatar(saved);
    }
  }, []);

  useEffect(() => {
    if (postToEdit) {
      setTitle(postToEdit.title || '');
      setContent(postToEdit.content || '');
      setCategory(postToEdit.category || 'Daily Life Updates');
      setMood(postToEdit.mood || '☕ Daily Life');
      setCoverImage(postToEdit.coverImage || '');
      setSelectedFile(null);
      setIsPrivate(Boolean(postToEdit.isPrivate));
      setErrorMessage('');
      setUploadStatus('');
    } else {
      setContent('');
      setTitle('');
      setCategory('Daily Life Updates');
      setMood('☕ Daily Life');
      setCoverImage('');
      setSelectedFile(null);
      setIsPrivate(false);
      setErrorMessage('');
      setUploadStatus('');
    }
  }, [postToEdit, isOpen]);

  if (!isOpen) return null;

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (JPEG, PNG, WebP, or GIF).');
      return;
    }

    try {
      setIsOptimizing(true);
      setErrorMessage('');

      // Automatic client-side image optimization:
      // Resizes oversized photos to max 1600px width/height while preserving aspect ratio,
      // compresses JPEG/WebP to quality 0.85, and generates an optimized File and instant preview.
      const result = await optimizeImageForUpload(file, {
        maxWidth: 1600,
        maxHeight: 1600,
        quality: 0.85,
        maxInputBytes: 20 * 1024 * 1024,
      });

      setSelectedFile(result.file);
      setCoverImage(result.previewUrl);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to process image file.';
      setErrorMessage(msg);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleRemovePhoto = () => {
    setCoverImage('');
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!content.trim() && !coverImage && !selectedFile) {
      setErrorMessage('Please write something or attach a photo.');
      return;
    }

    setIsSubmitting(true);

    const autoTitle =
      title.trim() ||
      content.trim().split('\n')[0].slice(0, 70) ||
      `${mood} - ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

    try {
      let finalCoverImageUrl: string | null = null;

      // 1. If a new image file was selected, upload it to the secure cloud storage endpoint
      if (selectedFile) {
        setUploadStatus('Uploading photo to secure cloud storage...');
        const formData = new FormData();
        formData.append('file', selectedFile);

        const uploadRes = await fetch('/api/blog/upload', {
          method: 'POST',
          headers: {
            'x-csrf-token': csrfToken || '',
          },
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok || !uploadData.success || (!uploadData.storagePath && !uploadData.url)) {
          throw new Error(uploadData.error || 'Failed to upload photo to cloud storage.');
        }

        // Store canonical storage path (e.g. blog-images/post_123.jpg) in the database record
        finalCoverImageUrl = uploadData.storagePath || uploadData.url;
      } else if (
        coverImage &&
        (coverImage.startsWith('http') ||
          coverImage.startsWith('/') ||
          coverImage.startsWith('blog-images/') ||
          coverImage.startsWith('storage:'))
      ) {
        // Preserve existing storage path or URL during edit
        finalCoverImageUrl = coverImage;
      }

      setUploadStatus(isEditMode ? 'Updating post...' : 'Publishing thought...');

      // 2. Submit post record to /api/blog with the image URL (clean, tiny JSON payload)
      const bodyPayload = isEditMode
        ? {
            id: postToEdit!.id,
            title: autoTitle,
            category,
            mood,
            content: content.trim(),
            coverImage: finalCoverImageUrl,
            tags: [category, mood.replace(/^[^\s]+\s/, '')],
            isPrivate,
          }
        : {
            title: autoTitle,
            category,
            mood,
            content: content.trim(),
            coverImage: finalCoverImageUrl || undefined,
            tags: [category, mood.replace(/^[^\s]+\s/, '')],
            isPrivate,
            authorAvatar,
          };

      const res = await fetch('/api/blog', {
        method: isEditMode ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken || '',
        },
        body: JSON.stringify(bodyPayload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || `Failed to ${isEditMode ? 'update' : 'publish'} post`);
      }

      if (isEditMode && onPostUpdated) {
        onPostUpdated(data.post);
      } else if (!isEditMode && onPostCreated) {
        onPostCreated(data.post);
      }

      // Reset form
      setContent('');
      setTitle('');
      setCoverImage('');
      setSelectedFile(null);
      setUploadStatus('');
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error publishing post';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
      setUploadStatus('');
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
              {isEditMode ? (
                <>
                  <Edit3 className="w-4 h-4 text-sky-400" />
                  <span>Edit Post & Update</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>Create Post & Daily Update</span>
                </>
              )}
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
                  alt="Abdullah Al Nayem"
                  className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500/60 shadow-md"
                />
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Abdullah Al Nayem</span>
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

            {/* Optional Title Input */}
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post title or headline (optional)..."
              className="w-full px-4 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 font-medium"
            />

            {/* Textarea for Content */}
            <textarea
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind? Share thoughts, code learnings, political reflections, or updates..."
              className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 leading-relaxed resize-y"
            />

            {/* Attached Photo Preview */}
            {coverImage && (
              <div className="relative rounded-xl overflow-hidden border border-white/10 max-h-60 bg-black/40 group">
                <img
                  src={coverImage}
                  alt="Post attachment"
                  className="w-full h-full object-cover max-h-60"
                />
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 text-rose-400 hover:text-rose-300 hover:bg-slate-900 border border-white/10 transition-colors"
                  title="Remove attached photo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Image Optimization / Upload Status Feedback */}
            {isOptimizing && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-300 text-xs font-mono">
                <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
                <span>Optimizing image dimensions and file size...</span>
              </div>
            )}
            {uploadStatus && !isOptimizing && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                <span>{uploadStatus}</span>
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

            {/* Bottom Action Bar: Add Photo button & Submit button */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting || isOptimizing}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-mono transition-all disabled:opacity-50 ${
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
                disabled={isSubmitting || isOptimizing || (!content.trim() && !coverImage && !selectedFile)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-sky-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-40 active:scale-95"
              >
                {isSubmitting ? (
                  <span>{uploadStatus || (isEditMode ? 'Saving...' : 'Publishing...')}</span>
                ) : isOptimizing ? (
                  <span>Optimizing...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>{isEditMode ? 'Save Changes' : 'Post'}</span>
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
