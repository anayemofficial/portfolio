'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, GraduationCap, Code, Brain, CheckCircle2 } from 'lucide-react';
import { portfolioData } from '@/data/portfolioData';

export function Experience() {
  const { timeline } = portfolioData;

  return (
    <section id="experience" className="py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="flex flex-col items-start mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono text-xs font-medium mb-3">
            <span>// EXPERIENCE & JOURNEY</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Academic & Technical <span className="text-gradient">Growth Timeline</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mt-2">
            A transparent record of my software engineering degree, full-stack project builds, and machine learning research.
          </p>
        </div>

        {/* Timeline Vertical Stack */}
        <div className="relative border-l-2 border-indigo-500/30 pl-6 sm:pl-10 space-y-12 ml-2 sm:ml-6">
          {timeline.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative group"
            >
              {/* Timeline Bullet Icon */}
              <div className="absolute -left-[31px] sm:-left-[47px] top-0.5 p-2 rounded-full bg-slate-900 border-2 border-indigo-500 text-indigo-400 shadow-md shadow-indigo-500/20">
                {item.category === 'Education' ? (
                  <GraduationCap className="w-4 h-4" />
                ) : item.category === 'AI/Data Science' ? (
                  <Brain className="w-4 h-4" />
                ) : (
                  <Code className="w-4 h-4" />
                )}
              </div>

              {/* Card Container */}
              <div className="p-6 rounded-2xl glass-card border border-white/10 group-hover:border-indigo-500/40 transition-all duration-300">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-mono px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    {item.period}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {item.institutionOrContext}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-xs text-slate-300 mb-4 leading-relaxed">{item.description}</p>

                {/* Highlights List */}
                <div className="space-y-1.5 pt-2 border-t border-white/5">
                  {item.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
