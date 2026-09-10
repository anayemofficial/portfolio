'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Code2, Sparkles } from 'lucide-react';
import { GithubIcon } from '@/components/Icons';
import { portfolioData } from '@/data/portfolioData';

export function GithubSection() {
  const { socials } = portfolioData.personal;

  const repositories = [
    {
      name: 'madx.bd',
      description: 'Flagship live client commercial e-commerce web platform built with React, Next.js, Express, and Supabase.',
      language: 'TypeScript / Next.js',
      status: 'Live Platform',
      link: `${socials.github}/madx.bd`,
      isFlagship: true,
    },
    {
      name: 'Sketch2Design-AI',
      description: 'Generative AI-powered sketch-to-UI conversion engine built with React, TypeScript, Vite, and Vision AI.',
      language: 'TypeScript / Vite',
      status: 'Completed Project',
      link: `${socials.github}/Sketch2Design-AI`,
    },
    {
      name: 'Photo-Hub',
      description: 'Full-stack photo gallery and media management API built with Node.js, Express, Supabase Auth & PostgreSQL.',
      language: 'JavaScript / Node.js',
      status: 'Completed Project',
      link: `${socials.github}/Photo-Hub`,
    },
    {
      name: 'Scientific-Calculator',
      description: 'Desktop GUI scientific calculator built in Python using Tkinter with 2D function graph plotting capabilities.',
      language: 'Python / Tkinter',
      status: 'Completed Project',
      link: `${socials.github}/Scientific-Calculator`,
    },
    {
      name: 'Skin-Disease-Classification',
      description: 'Deep learning computer vision research model built in PyTorch & Torchvision for multi-class image classification.',
      language: 'Python / PyTorch',
      status: 'Research Project',
      link: `${socials.github}/Skin-Disease-Classification`,
    },
    {
      name: 'Health-Super-App-Concept',
      description: 'Multi-tenant digital healthcare platform architecture model connecting patients, physicians, and appointments.',
      language: 'System Architecture',
      status: 'Product Concept',
      link: `${socials.github}/Health-Super-App-Concept`,
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono text-xs font-medium mb-3">
              <span>// REAL REPOSITORIES & OPEN SOURCE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              GitHub Repositories & <span className="text-gradient">Source Code</span>
            </h2>
          </div>

          <a
            href={socials.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 border border-white/10 rounded-xl transition-all hover:border-indigo-500/50"
          >
            <GithubIcon className="w-4 h-4" />
            <span>@anayemofficial on GitHub</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Repositories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {repositories.map((repo, idx) => (
            <motion.a
              key={repo.name}
              href={repo.link}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className={`p-6 rounded-2xl glass-card border transition-all duration-300 group flex flex-col justify-between ${
                repo.isFlagship
                  ? 'border-emerald-500/40 hover:border-emerald-400 bg-gradient-to-b from-emerald-950/20 via-slate-900 to-slate-900 shadow-lg shadow-emerald-500/5'
                  : 'border-white/10 hover:border-indigo-500/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-white font-bold font-mono group-hover:text-indigo-300 transition-colors">
                    <Code2 className={`w-4 h-4 ${repo.isFlagship ? 'text-emerald-400' : 'text-indigo-400'}`} />
                    <span>{repo.name}</span>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                    repo.status === 'Live Platform'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : repo.status === 'Research Project'
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                      : repo.status === 'Product Concept'
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                      : 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                  }`}>
                    {repo.status}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mb-4 leading-relaxed line-clamp-3">
                  {repo.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/5 text-[11px] font-mono text-slate-500">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className={`w-2.5 h-2.5 rounded-full inline-block ${repo.isFlagship ? 'bg-emerald-400' : 'bg-indigo-400'}`} />
                  {repo.language}
                </span>
                <span className="flex items-center gap-1 group-hover:text-indigo-400 transition-colors">
                  <span>View Repository</span>
                  <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </motion.a>
          ))}
        </div>

      </div>
    </section>
  );
}
