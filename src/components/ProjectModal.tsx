'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, CheckCircle2, AlertCircle, Cpu, Layers, Terminal, Sparkles, FlaskConical } from 'lucide-react';
import { GithubIcon } from '@/components/Icons';
import { Project } from '@/data/portfolioData';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export function ProjectModal({ project, onClose }: ProjectModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (project) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [project, onClose]);

  if (!project) return null;

  const renderModalStatusBadge = (status: Project['currentStatus']) => {
    switch (status) {
      case 'Live Platform':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Live Platform</span>
          </span>
        );
      case 'Completed Project':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/40 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
            <span>Completed Project</span>
          </span>
        );
      case 'Research Project':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1">
            <FlaskConical className="w-3.5 h-3.5 text-purple-400" />
            <span>Research Project</span>
          </span>
        );
      case 'Product Concept':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Product Concept</span>
          </span>
        );
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#090d16]/85 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-y-auto z-10 flex flex-col my-auto"
        >
          {/* Sticky Modal Header */}
          <div className="sticky top-0 bg-slate-900/90 backdrop-blur-md px-6 py-4 border-b border-white/10 flex items-center justify-between z-20">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-mono font-semibold">
                {project.category}
              </span>
              {project.projectType && (
                <span className={`px-2.5 py-1 rounded text-xs font-mono font-semibold border ${
                  project.projectType === 'Client Project'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : project.projectType === 'Personal Project'
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                    : 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                }`}>
                  {project.projectType}
                </span>
              )}
              {renderModalStatusBadge(project.currentStatus)}
              <h3 className="text-xl font-bold text-white tracking-tight hidden sm:block">{project.title}</h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              aria-label="Close Case Study"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body Content */}
          <div className="p-6 sm:p-8 space-y-8 text-slate-300">
            
            {/* Banner & Tagline */}
            <div className={`p-6 rounded-xl border ${
              project.isFlagship
                ? 'bg-gradient-to-r from-emerald-950/80 via-slate-900 to-emerald-950/80 border-emerald-500/40'
                : 'bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 border-indigo-500/30'
            }`}>
              <div className="text-xs font-mono text-indigo-400 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>CASE STUDY BRIEF</span>
              </div>
              <h4 className="text-2xl font-bold text-white mb-2">{project.title}</h4>
              <p className="text-xs font-mono text-indigo-300 mb-3">{project.tagline}</p>
              <p className="text-sm text-slate-300 leading-relaxed">{project.detailedOverview}</p>
            </div>

            {/* Links Bar */}
            <div className="flex flex-wrap gap-4 pt-2">
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-md transition-colors"
                >
                  <span>Visit Live Demo ({project.liveUrl})</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-lg transition-colors"
                >
                  <GithubIcon className="w-4 h-4" />
                  <span>GitHub Repository</span>
                </a>
              )}
            </div>

            {/* 1. Problem & 2. Solution Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-xl bg-slate-950/80 border border-rose-500/20">
                <h5 className="text-sm font-bold text-rose-400 font-mono mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  THE PROBLEM
                </h5>
                <p className="text-xs text-slate-300 leading-relaxed">{project.problem}</p>
              </div>

              <div className="p-5 rounded-xl bg-slate-950/80 border border-emerald-500/20">
                <h5 className="text-sm font-bold text-emerald-400 font-mono mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  THE SOLUTION
                </h5>
                <p className="text-xs text-slate-300 leading-relaxed">{project.solution}</p>
              </div>
            </div>

            {/* 3. My Role */}
            <div className="p-5 rounded-xl bg-slate-950/60 border border-white/10">
              <h5 className="text-sm font-bold text-indigo-400 font-mono mb-2 flex items-center gap-2">
                <Layers className="w-4 h-4" />
                MY ROLE & RESPONSIBILITIES
              </h5>
              <p className="text-xs text-slate-300">{project.role}</p>
            </div>

            {/* 4. Technologies Used */}
            <div>
              <h5 className="text-sm font-bold text-white font-mono mb-3 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-sky-400" />
                TECHNOLOGY STACK
              </h5>
              <div className="flex flex-wrap gap-2">
                {project.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 text-xs font-mono rounded-lg bg-indigo-950/70 border border-indigo-500/30 text-indigo-300"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* 5. Key Features */}
            <div>
              <h5 className="text-sm font-bold text-white font-mono mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                KEY FEATURES IMPLEMENTED
              </h5>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                {project.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-950/50 border border-white/5">
                    <span className="text-indigo-400 font-mono font-bold">•</span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 6. Development Process */}
            <div>
              <h5 className="text-sm font-bold text-white font-mono mb-3 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-amber-400" />
                DEVELOPMENT PROCESS
              </h5>
              <div className="space-y-2">
                {project.developmentProcess.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-950/40 border border-white/5 text-xs text-slate-300">
                    <span className="w-5 h-5 rounded-full bg-slate-800 border border-white/10 text-indigo-400 flex items-center justify-center font-mono text-[10px] shrink-0">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 7. Key Engineering Challenges */}
            <div>
              <h5 className="text-sm font-bold text-rose-400 font-mono mb-3">ENGINEERING CHALLENGES</h5>
              <div className="space-y-2 text-xs text-slate-300">
                {project.challenges.map((c, i) => (
                  <div key={i} className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/20">
                    {c}
                  </div>
                ))}
              </div>
            </div>

            {/* 8. Current Status & Results */}
            <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between text-xs">
              <span className="font-mono text-slate-400">PROJECT STATUS:</span>
              <div className="font-bold">{renderModalStatusBadge(project.currentStatus)}</div>
            </div>

          </div>

          {/* Footer Close */}
          <div className="px-6 py-4 bg-slate-900 border-t border-white/10 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Close Window
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
