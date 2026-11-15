'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, Send, FileText, Mail, Sparkles, Terminal, Code } from 'lucide-react';
import { GithubIcon, LinkedinIcon, FacebookIcon, InstagramIcon, PhoneIcon } from '@/components/Icons';
import { portfolioData } from '@/data/portfolioData';
import { ActiveView } from '@/components/Navbar';

interface HeroProps {
  onNavigate?: (view: ActiveView) => void;
  className?: string;
}

export function Hero({ onNavigate, className }: HeroProps = {}) {
  const { personal } = portfolioData;

  return (
    <section
      id="home"
      className={
        className ||
        'relative flex items-center justify-center py-6 sm:py-8 overflow-hidden'
      }
    >
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* Left Column: Copy & CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-7 flex flex-col items-start text-left"
        >
          {/* Status Pulse Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-medium mb-6 shadow-sm shadow-emerald-500/5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>{personal.statusBadge}</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-4">
            Hi, I'm{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-indigo-400">
              {personal.name}
            </span>
            <span className="text-indigo-500">.</span>
          </h1>

          {/* Supporting Headline */}
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-slate-200 mb-3 leading-snug">
            {personal.subTitle}
          </h2>

          {/* Short Positioning Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 font-mono text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>{personal.shortPositioning}</span>
          </div>

          {/* Description */}
          <p className="text-base sm:text-lg text-slate-400 mb-8 max-w-2xl leading-relaxed">
            {personal.bio}
          </p>

          {/* CTAs Button Row */}
          <div className="flex flex-wrap items-center gap-4 mb-8 w-full sm:w-auto">
            {/* Primary CTA */}
            <a
              href="/?view=projects"
              onClick={(e) => {
                if (onNavigate) {
                  e.preventDefault();
                  onNavigate('projects');
                }
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 transition-all duration-200 active:scale-95"
            >
              <span>View My Work</span>
              <ArrowDown className="w-4 h-4" />
            </a>

            {/* Secondary CTA */}
            <a
              href="/?view=contact"
              onClick={(e) => {
                if (onNavigate) {
                  e.preventDefault();
                  onNavigate('contact');
                }
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-white/10 rounded-xl hover:border-white/20 transition-all duration-200 active:scale-95"
            >
              <span>Let's Work Together</span>
              <Send className="w-4 h-4 text-sky-400" />
            </a>

            {/* Download CV */}
            <a
              href={personal.cvUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-semibold text-slate-300 hover:text-white bg-slate-900/40 hover:bg-slate-900/80 border border-white/5 hover:border-white/10 rounded-xl transition-all duration-200"
              title="Download Resume / Curriculum Vitae"
            >
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Download CV</span>
            </a>
          </div>

          {/* Social Links Bar */}
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/5 w-full">
            <span className="text-xs text-slate-500 font-mono">CONNECT:</span>
            <a
              href={personal.socials.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub Profile"
              className="p-2.5 rounded-lg bg-slate-900/70 border border-white/10 text-slate-400 hover:text-white hover:border-indigo-500/50 hover:bg-indigo-600/10 transition-all duration-200"
            >
              <GithubIcon className="w-4 h-4" />
            </a>
            <a
              href={personal.socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn Profile"
              className="p-2.5 rounded-lg bg-slate-900/70 border border-white/10 text-slate-400 hover:text-sky-400 hover:border-sky-500/50 hover:bg-sky-600/10 transition-all duration-200"
            >
              <LinkedinIcon className="w-4 h-4" />
            </a>
            <a
              href={personal.socials.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook Profile"
              className="p-2.5 rounded-lg bg-slate-900/70 border border-white/10 text-slate-400 hover:text-blue-400 hover:border-blue-500/50 hover:bg-blue-600/10 transition-all duration-200"
            >
              <FacebookIcon className="w-4 h-4" />
            </a>
            <a
              href={personal.socials.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram Profile"
              className="p-2.5 rounded-lg bg-slate-900/70 border border-white/10 text-slate-400 hover:text-pink-400 hover:border-pink-500/50 hover:bg-pink-600/10 transition-all duration-200"
            >
              <InstagramIcon className="w-4 h-4" />
            </a>
            <a
              href={`mailto:${personal.socials.email}`}
              aria-label="Send Email"
              className="p-2.5 rounded-lg bg-slate-900/70 border border-white/10 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/50 hover:bg-emerald-600/10 transition-all duration-200"
            >
              <Mail className="w-4 h-4" />
            </a>
          </div>
        </motion.div>

        {/* Right Column: Interactive Developer Visual Component */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="lg:col-span-5 flex justify-center"
        >
          <div className="w-full max-w-md rounded-2xl glass-card border border-white/10 shadow-2xl p-5 relative overflow-hidden group">
            {/* Ambient inner glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl group-hover:bg-indigo-500/30 transition-all" />

            {/* Mock Code Window Titlebar */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10 font-mono text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                <span>developer.ts</span>
              </div>
              <div className="text-[10px] text-slate-500">UTF-8</div>
            </div>

            {/* Code Content */}
            <div className="font-mono text-xs sm:text-sm space-y-2 text-slate-300">
              <p>
                <span className="text-purple-400">const</span>{' '}
                <span className="text-sky-300">developer</span> = &#123;
              </p>
              <p className="pl-4">
                <span className="text-slate-400">name:</span>{' '}
                <span className="text-emerald-300">"{personal.name}"</span>,
              </p>
              <p className="pl-4">
                <span className="text-slate-400">education:</span> &#123;
              </p>
              <p className="pl-8">
                <span className="text-slate-400">degree:</span>{' '}
                <span className="text-amber-300">"BSc Software Engineering"</span>,
              </p>
              <p className="pl-8">
                <span className="text-slate-400">university:</span>{' '}
                <span className="text-emerald-300">"Daffodil International Univ"</span>,
              </p>
              <p className="pl-4">&#125;,</p>
              <p className="pl-4">
                <span className="text-slate-400">focus:</span> [
              </p>
              <p className="pl-8 text-indigo-300">
                "Full-Stack", "REST APIs", "Data Science", "AI & PyTorch"
              </p>
              <p className="pl-4">],</p>
              <p className="pl-4">
                <span className="text-slate-400">status:</span>{' '}
                <span className="text-emerald-400">"Ready to Build & Deploy"</span>
              </p>
              <p>&#125;;</p>

              {/* Console Action Mock */}
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 flex items-center gap-1">
                  <Code className="w-3.5 h-3.5 text-emerald-400" />
                  npm run build:scalable-product
                </span>
                <span className="text-emerald-400 font-semibold animate-pulse">✓ Ready</span>
              </div>
            </div>

            {/* Quick Tech Badge Grid */}
            <div className="mt-5 pt-4 border-t border-white/5 grid grid-cols-4 gap-2 text-center text-[10px] font-mono text-slate-400">
              <div className="p-1.5 rounded bg-slate-900/60 border border-white/5">Next.js</div>
              <div className="p-1.5 rounded bg-slate-900/60 border border-white/5">TypeScript</div>
              <div className="p-1.5 rounded bg-slate-900/60 border border-white/5">Node.js</div>
              <div className="p-1.5 rounded bg-slate-900/60 border border-white/5">PyTorch</div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
