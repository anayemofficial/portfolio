'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, ArrowRight, Sparkles, CheckCircle2, FlaskConical, Layers, Zap } from 'lucide-react';
import { GithubIcon } from '@/components/Icons';
import { portfolioData, Project } from '@/data/portfolioData';
import { ProjectModal } from './ProjectModal';

export function Projects() {
  const { projects } = portfolioData;
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [activeModalProject, setActiveModalProject] = useState<Project | null>(null);

  const categories = ['All', 'Full-Stack', 'AI / Data Science', 'Academic Research', 'Concept'];

  const filteredProjects =
    selectedFilter === 'All'
      ? projects
    : selectedFilter === 'Academic Research'
    ? projects.filter((p) => p.projectType === 'Academic Research' || (p.category as string) === 'Academic Research')
    : projects.filter((p) => p.category === selectedFilter);

  const getStatusBadge = (status: Project['currentStatus']) => {
    switch (status) {
      case 'Live Platform':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            <span>Live Platform</span>
          </span>
        );
      case 'Completed Project':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/40">
            <CheckCircle2 className="w-3 h-3 text-sky-400 shrink-0" />
            <span>Completed Project</span>
          </span>
        );
      case 'Research Project':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/40">
            <FlaskConical className="w-3 h-3 text-purple-400 shrink-0" />
            <span>Research Project</span>
          </span>
        );
      case 'Product Concept':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
            <Layers className="w-3 h-3 text-indigo-400 shrink-0" />
            <span>Product Concept</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <section id="projects" className="py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="flex flex-col items-start mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono text-xs font-medium mb-3">
            <span>// FEATURED WORK</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Real Projects & Software <span className="text-gradient">Architectures</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mt-2">
            Explore full-stack commercial platforms, generative AI engines, deep learning research, and software architecture concepts.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-2 mb-10 border-b border-white/10 pb-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedFilter(cat)}
              className={`px-4 py-2 text-xs font-mono font-medium rounded-lg transition-all duration-200 ${
                selectedFilter === cat
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-400/40'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Projects Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`group relative rounded-2xl glass-card border overflow-hidden flex flex-col justify-between transition-all duration-300 ${
                project.isFlagship
                  ? 'border-emerald-500/50 shadow-2xl shadow-emerald-500/10 hover:border-emerald-400 bg-gradient-to-b from-emerald-950/20 via-slate-900 to-slate-900'
                  : 'border-white/10 hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/10'
              }`}
            >
              <div>
                {/* Flagship Banner Header if applicable */}
                {project.isFlagship && (
                  <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-1.5 text-center text-[11px] font-mono font-bold text-white tracking-wider flex items-center justify-center gap-1.5 shadow-md">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>★ FLAGSHIP COMMERCIAL PROJECT</span>
                  </div>
                )}

                {/* Header Category & Status Badge */}
                <div className="p-6 pb-4 border-b border-white/5 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-500/30">
                      {project.category}
                    </span>
                    {project.projectType && (
                      <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
                        project.projectType === 'Client Project'
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                          : project.projectType === 'Personal Project'
                          ? 'bg-sky-950/80 text-sky-300 border-sky-500/40'
                          : 'bg-purple-950/80 text-purple-300 border-purple-500/40'
                      }`}>
                        {project.projectType}
                      </span>
                    )}
                  </div>
                  
                  {/* Status Badge */}
                  {getStatusBadge(project.currentStatus)}
                </div>

                {/* Main Card Body */}
                <div className="p-6 space-y-4">
                  <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors flex items-center gap-2">
                    {project.title}
                    {project.isFlagship && <Zap className="w-4 h-4 text-emerald-400 shrink-0" />}
                  </h3>
                  <p className="text-xs font-mono text-slate-400">{project.tagline}</p>

                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                    {project.description}
                  </p>

                  {/* Problem Solved Callout */}
                  <div className="p-3 rounded-lg bg-slate-950/70 border border-white/5">
                    <span className="text-[10px] font-mono text-indigo-400 uppercase font-semibold block mb-1">
                      Problem Solved:
                    </span>
                    <p className="text-[11px] text-slate-300 line-clamp-2">
                      {project.problem}
                    </p>
                  </div>

                  {/* Tech Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {project.techStack.slice(0, 4).map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-0.5 text-[10px] font-mono rounded bg-slate-900 text-slate-300 border border-white/5"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.techStack.length > 4 && (
                      <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-slate-900 text-slate-400">
                        +{project.techStack.length - 4}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer: Action Buttons */}
              <div className="p-6 pt-0 border-t border-white/5 mt-4 flex items-center justify-between gap-2">
                <button
                  onClick={() => setActiveModalProject(project)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
                    project.isFlagship
                      ? 'text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20'
                      : 'text-white bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40'
                  }`}
                >
                  <span>View Case Study</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-2">
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-slate-900 border border-white/10 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="GitHub Repository"
                    >
                      <GithubIcon className="w-4 h-4" />
                    </a>
                  )}
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-slate-900 border border-white/10 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
                      title="Live Website"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Modal render */}
        <ProjectModal
          project={activeModalProject}
          onClose={() => setActiveModalProject(null)}
        />

      </div>
    </section>
  );
}
