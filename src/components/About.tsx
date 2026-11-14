'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { GraduationCap, Code, Cpu, Database, Award, ArrowUpRight } from 'lucide-react';
import { portfolioData } from '@/data/portfolioData';

export function About() {
  const { personal } = portfolioData;

  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="flex flex-col items-start mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono text-xs font-medium mb-3">
            <span>// ABOUT ME</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Engineering digital solutions with{' '}
            <span className="text-gradient">code, data, and intelligence.</span>
          </h2>
        </div>

        {/* Grid Layout: Portrait Frame + Storytelling */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Portrait & Card Presentation */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 flex justify-center"
          >
            <div className="relative w-full max-w-sm">
              {/* Decorative Accent Glow */}
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500 opacity-30 blur-lg group-hover:opacity-100 transition duration-1000" />
              
              {/* Photo Frame Container */}
              <div className="relative rounded-2xl bg-slate-900 border border-white/10 p-2 overflow-hidden shadow-2xl">
                <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-slate-800">
                  <Image
                    src={personal.avatarUrl}
                    alt={personal.name}
                    fill
                    className="object-cover object-top hover:scale-105 transition-transform duration-500"
                    priority
                  />
                  {/* Glass Gradient overlay at bottom */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#090d16] via-[#090d16]/60 to-transparent p-4 pt-12">
                    <div className="text-white font-bold text-lg">{personal.name}</div>
                    <div className="text-indigo-400 text-xs font-mono">{personal.title}</div>
                  </div>
                </div>

                {/* Institution Badge */}
                <div className="mt-3 p-3 rounded-xl bg-slate-950/80 border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">{personal.university}</div>
                      <div className="text-[11px] text-slate-400">{personal.degree}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Professional Storytelling */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 flex flex-col gap-6"
          >
            <div className="prose prose-invert max-w-none text-slate-300 space-y-4 text-base leading-relaxed">
              <p>
                I am a <strong className="text-white">Software Engineering graduate</strong> from{' '}
                <span className="text-indigo-400 font-medium">{personal.university}</span> with a deep passion for designing, developing, and deploying complete software products.
              </p>
              <p>
                My background bridges the gap between modern full-stack web engineering and data science. I enjoy turning complex ideas into intuitive, scalable software—ranging from high-speed frontend interfaces and RESTful backend architectures to predictive machine-learning pipelines and computer vision systems.
              </p>
              <p>
                I prioritize writing clean, maintainable code, building secure database systems, and solving practical real-world problems. Whether building commercial web platforms like MADX and Krishi Gold or researching AI classification models, I bring a product-first engineering mindset to every endeavor.
              </p>
            </div>

            {/* 4 Core Pillars Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="p-4 rounded-xl glass-card border border-white/10 hover:border-indigo-500/30 transition-colors">
                <div className="p-2 w-fit rounded-lg bg-indigo-500/10 text-indigo-400 mb-2">
                  <Code className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">Full-Stack Web Engineering</h3>
                <p className="text-xs text-slate-400">
                  Building end-to-end applications using React, Next.js, Node.js, Express, and MongoDB.
                </p>
              </div>

              <div className="p-4 rounded-xl glass-card border border-white/10 hover:border-sky-500/30 transition-colors">
                <div className="p-2 w-fit rounded-lg bg-sky-500/10 text-sky-400 mb-2">
                  <Cpu className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">Data Science & AI</h3>
                <p className="text-xs text-slate-400">
                  Developing machine learning models, computer vision pipelines, and analytical tools in Python & PyTorch.
                </p>
              </div>

              <div className="p-4 rounded-xl glass-card border border-white/10 hover:border-emerald-500/30 transition-colors">
                <div className="p-2 w-fit rounded-lg bg-emerald-500/10 text-emerald-400 mb-2">
                  <Database className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">Database & API Design</h3>
                <p className="text-xs text-slate-400">
                  Designing structured data schemas in MongoDB, MySQL, and PostgreSQL with robust RESTful APIs.
                </p>
              </div>

              <div className="p-4 rounded-xl glass-card border border-white/10 hover:border-amber-500/30 transition-colors">
                <div className="p-2 w-fit rounded-lg bg-amber-500/10 text-amber-400 mb-2">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">Software Architecture</h3>
                <p className="text-xs text-slate-400">
                  Focusing on maintainability, performance, security, and scalable software design patterns.
                </p>
              </div>
            </div>

            {/* Academic Highlight Banner */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/20 flex items-center justify-between">
              <div className="text-xs text-slate-300">
                Focused on delivering complete, production-ready software solutions for international clients and software teams.
              </div>
              <a
                href="#projects"
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 whitespace-nowrap pl-2"
              >
                <span>Explore Projects</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>

          </motion.div>

        </div>

      </div>
    </section>
  );
}
