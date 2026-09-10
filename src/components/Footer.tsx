'use client';

import React from 'react';
import { ArrowUp, Mail, Briefcase, Code2 } from 'lucide-react';
import { GithubIcon, LinkedinIcon, FacebookIcon, InstagramIcon } from '@/components/Icons';
import { portfolioData } from '@/data/portfolioData';

export function Footer() {
  const { personal } = portfolioData;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#050810] border-t border-white/10 pt-16 pb-12 px-4 sm:px-6 lg:px-8 relative text-slate-400">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 pb-12 border-b border-white/5">
        
        {/* Brand & Positioning */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Code2 className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">{personal.name}</span>
          </div>
          <p className="text-xs font-mono text-indigo-400">{personal.title}</p>
          <p className="text-xs text-slate-400 max-w-md">
            Designing, developing, deploying, and maintaining complete digital products and scalable software solutions.
          </p>
        </div>

        {/* Social Icons Row */}
        <div className="flex items-center gap-3">
          <a
            href={personal.socials.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub Profile"
            className="p-3 rounded-xl bg-slate-900 border border-white/10 text-slate-400 hover:text-white hover:border-indigo-500/50 hover:bg-indigo-600/10 transition-all"
          >
            <GithubIcon className="w-5 h-5" />
          </a>

          <a
            href={personal.socials.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn Profile"
            className="p-3 rounded-xl bg-slate-900 border border-white/10 text-slate-400 hover:text-sky-400 hover:border-sky-500/50 hover:bg-sky-600/10 transition-all"
          >
            <LinkedinIcon className="w-5 h-5" />
          </a>

          <a
            href={personal.socials.facebook}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook Profile"
            className="p-3 rounded-xl bg-slate-900 border border-white/10 text-slate-400 hover:text-blue-400 hover:border-blue-500/50 hover:bg-blue-600/10 transition-all"
          >
            <FacebookIcon className="w-5 h-5" />
          </a>

          <a
            href={personal.socials.instagram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram Profile"
            className="p-3 rounded-xl bg-slate-900 border border-white/10 text-slate-400 hover:text-pink-400 hover:border-pink-500/50 hover:bg-pink-600/10 transition-all"
          >
            <InstagramIcon className="w-5 h-5" />
          </a>

          <a
            href={personal.socials.fiverr}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Fiverr Freelance Profile"
            className="p-3 rounded-xl bg-slate-900 border border-white/10 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/50 hover:bg-emerald-600/10 transition-all"
          >
            <Briefcase className="w-5 h-5" />
          </a>

          <a
            href={`mailto:${personal.socials.email}`}
            aria-label="Email Direct"
            className="p-3 rounded-xl bg-slate-900 border border-white/10 text-slate-400 hover:text-indigo-400 hover:border-indigo-500/50 hover:bg-indigo-600/10 transition-all"
          >
            <Mail className="w-5 h-5" />
          </a>
        </div>

        {/* Back to Top */}
        <button
          onClick={scrollToTop}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs font-mono text-slate-300 hover:text-white transition-all active:scale-95"
        >
          <span>Back to top</span>
          <ArrowUp className="w-4 h-4 text-indigo-400" />
        </button>

      </div>

      {/* Copyright */}
      <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
        <p>© 2026 {personal.name}. All rights reserved.</p>
        <div className="flex items-center gap-6 font-mono text-[11px]">
          <a href="#about" className="hover:text-indigo-400 transition-colors">About</a>
          <a href="#projects" className="hover:text-indigo-400 transition-colors">Projects</a>
          <a href="#contact" className="hover:text-indigo-400 transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  );
}
