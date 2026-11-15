'use client';

import React, { useState } from 'react';
import { Share2, Check, Copy } from 'lucide-react';
import { FacebookIcon, WhatsAppIcon, LinkedinIcon, TwitterIcon } from '@/components/Icons';

interface ShareButtonsProps {
  url?: string;
  title: string;
  excerpt?: string;
  variant?: 'inline' | 'compact' | 'full' | 'button';
}

export function ShareButtons({ url, title, excerpt, variant = 'inline' }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const getShareUrl = () => {
    if (url) {
      if (url.startsWith('/')) {
        return `https://www.anayem.com${url}`;
      }
      return url;
    }
    return 'https://www.anayem.com/blog';
  };

  const shareUrl = getShareUrl();
  const shareText = `${title}${excerpt ? ' - ' + excerpt.slice(0, 100) + '...' : ''}`;

  const facebookLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
  const whatsappLink = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`;
  const linkedinLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
  const twitterLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          text: excerpt || title,
          url: shareUrl,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      handleCopy(e);
    }
  };

  if (variant === 'button') {
    return (
      <div className="relative flex items-center justify-center w-full" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => {
            if (typeof navigator !== 'undefined' && navigator.share && /Mobi|Android|iPhone/i.test(navigator.userAgent)) {
              navigator.share({ title, text: excerpt || title, url: shareUrl }).catch(() => {});
            } else {
              setShowDropdown(!showDropdown);
            }
          }}
          className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl hover:bg-slate-800/80 transition-all active:scale-95 ${
            showDropdown ? 'text-indigo-300 bg-slate-800/80 font-bold' : 'text-slate-400 hover:text-white'
          }`}
          title="Share Post"
        >
          <Share2 className="w-4 h-4 text-indigo-400" />
          <span>Share</span>
        </button>

        {/* Dropdown Menu when clicked */}
        {showDropdown && (
          <>
            {/* Backdrop to close when clicking outside */}
            <div
              className="fixed inset-0 z-30"
              onClick={() => setShowDropdown(false)}
            />
            <div className="absolute bottom-full mb-2 right-0 sm:right-auto z-40 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-2.5 min-w-[200px] backdrop-blur-xl space-y-1">
              <div className="px-2 py-1 text-[11px] font-mono text-slate-400 border-b border-white/5 mb-1 flex items-center justify-between">
                <span>Share to:</span>
                <button onClick={() => setShowDropdown(false)} className="text-slate-500 hover:text-white text-xs">✕</button>
              </div>

              {/* WhatsApp */}
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowDropdown(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-emerald-500/10 text-slate-200 hover:text-emerald-300 text-xs font-mono transition-colors"
              >
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <WhatsAppIcon className="w-3.5 h-3.5" />
                </div>
                <span>WhatsApp</span>
              </a>

              {/* Facebook */}
              <a
                href={facebookLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowDropdown(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-blue-500/10 text-slate-200 hover:text-blue-300 text-xs font-mono transition-colors"
              >
                <div className="w-6 h-6 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                  <FacebookIcon className="w-3.5 h-3.5" />
                </div>
                <span>Facebook</span>
              </a>

              {/* LinkedIn */}
              <a
                href={linkedinLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowDropdown(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-sky-500/10 text-slate-200 hover:text-sky-300 text-xs font-mono transition-colors"
              >
                <div className="w-6 h-6 rounded-lg bg-sky-500/20 flex items-center justify-center text-sky-400">
                  <LinkedinIcon className="w-3.5 h-3.5" />
                </div>
                <span>LinkedIn</span>
              </a>

              {/* Copy Link */}
              <button
                onClick={(e) => {
                  handleCopy(e);
                  setTimeout(() => setShowDropdown(false), 1200);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-200 text-xs font-mono transition-colors text-left"
              >
                <div className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300">
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </div>
                <span className={copied ? 'text-emerald-400 font-bold' : ''}>
                  {copied ? 'Link Copied!' : 'Copy Link'}
                </span>
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
        {/* WhatsApp */}
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          title="Share to WhatsApp"
          className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          <WhatsAppIcon className="w-3.5 h-3.5" />
        </a>

        {/* Facebook */}
        <a
          href={facebookLink}
          target="_blank"
          rel="noopener noreferrer"
          title="Share to Facebook"
          className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 transition-colors"
        >
          <FacebookIcon className="w-3.5 h-3.5" />
        </a>

        {/* Copy Link */}
        <button
          onClick={handleCopy}
          title="Copy Link"
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
        <Share2 className="w-3.5 h-3.5 text-indigo-400" />
        <span>Share this post to:</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* WhatsApp Button */}
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-mono transition-all hover:scale-105 active:scale-95"
          title="Share on WhatsApp"
        >
          <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-400" />
          <span>WhatsApp</span>
        </a>

        {/* Facebook Button */}
        <a
          href={facebookLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-mono transition-all hover:scale-105 active:scale-95"
          title="Share on Facebook"
        >
          <FacebookIcon className="w-3.5 h-3.5 text-blue-400" />
          <span>Facebook</span>
        </a>

        {/* LinkedIn Button */}
        <a
          href={linkedinLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 text-xs font-mono transition-all hover:scale-105 active:scale-95"
          title="Share on LinkedIn"
        >
          <LinkedinIcon className="w-3.5 h-3.5 text-sky-400" />
          <span>LinkedIn</span>
        </a>

        {/* X / Twitter Button */}
        <a
          href={twitterLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 text-xs font-mono transition-all hover:scale-105 active:scale-95"
          title="Share on X"
        >
          <TwitterIcon className="w-3.5 h-3.5 text-white" />
          <span>X</span>
        </a>

        {/* Copy Link Button */}
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/10 text-xs font-mono transition-colors"
          title="Copy Link to Clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Link</span>
            </>
          )}
        </button>

        {/* Mobile native share if available */}
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <button
            onClick={handleNativeShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-mono transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>More...</span>
          </button>
        )}
      </div>
    </div>
  );
}
