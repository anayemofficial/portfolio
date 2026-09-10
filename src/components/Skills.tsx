'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Code2,
  Palette,
  FileCode,
  FileJson,
  Atom,
  Zap,
  LayoutGrid,
  Server,
  Cpu,
  Globe,
  Lock,
  Key,
  Database,
  Table,
  HardDrive,
  Terminal,
  BarChart2,
  Binary,
  Brain,
  Activity,
  Sparkles,
  Eye,
  LineChart,
  GitBranch,
  Laptop,
  Send,
  Box,
  CheckCircle2,
} from 'lucide-react';
import { GithubIcon } from '@/components/Icons';
import { portfolioData } from '@/data/portfolioData';

// Icon Map for dynamic lookup
const iconMap: Record<string, React.ElementType> = {
  Code2,
  Palette,
  FileCode,
  FileJson,
  Atom,
  Zap,
  LayoutGrid,
  Server,
  Cpu,
  Globe,
  Lock,
  Key,
  Database,
  Table,
  HardDrive,
  Terminal,
  BarChart2,
  Binary,
  Brain,
  Activity,
  Sparkles,
  Eye,
  LineChart,
  GitBranch,
  Github: GithubIcon,
  Laptop,
  Send,
  Box,
};

export function Skills() {
  const { skills } = portfolioData;
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', ...skills.map((s) => s.category)];

  const filteredCategories =
    activeCategory === 'All'
      ? skills
      : skills.filter((s) => s.category === activeCategory);

  return (
    <section id="skills" className="py-20 px-4 sm:px-6 lg:px-8 relative bg-slate-950/40 border-y border-white/5">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="flex flex-col items-start mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono text-xs font-medium mb-3">
            <span>// TECHNICAL STACK</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Technologies & Tools I Use to{' '}
            <span className="text-gradient">Build Reliable Software</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mt-2">
            Organized across full-stack web development, database architecture, data science analytics, and deep learning engineering.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-10 border-b border-white/10 pb-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 text-xs font-mono font-medium rounded-lg transition-all duration-200 ${
                activeCategory === cat
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-400/40'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Skill Category Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((group, idx) => (
            <motion.div
              key={group.category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="p-6 rounded-2xl glass-card border border-white/10 hover:border-indigo-500/30 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-white font-mono tracking-tight flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    {group.category}
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {group.skills.length} skills
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                  {group.description}
                </p>

                {/* Skill Pills */}
                <div className="flex flex-wrap gap-2">
                  {group.skills.map((skill) => {
                    const IconComponent = iconMap[skill.icon] || CheckCircle2;
                    return (
                      <div
                        key={skill.name}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                          skill.highlighted
                            ? 'bg-indigo-950/80 text-indigo-200 border border-indigo-500/40 shadow-sm'
                            : 'bg-slate-900/90 text-slate-300 border border-white/5 hover:border-white/20 hover:text-white'
                        }`}
                      >
                        <IconComponent
                          className={`w-3.5 h-3.5 ${
                            skill.highlighted ? 'text-indigo-400' : 'text-slate-400'
                          }`}
                        />
                        <span>{skill.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
