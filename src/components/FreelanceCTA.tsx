'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, ArrowUpRight, Sparkles } from 'lucide-react';
import { portfolioData } from '@/data/portfolioData';

export function FreelanceCTA() {
  const { socials } = portfolioData.personal;

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative rounded-3xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-indigo-950/80 border border-indigo-500/30 p-8 sm:p-12 overflow-hidden shadow-2xl"
        >
          {/* Subtle Ambient Light */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                <span>FREELANCE & CONTRACT SERVICES</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Need a developer for your next project?
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Let's turn your idea into a reliable, modern, and scalable digital product. Available for website development, REST APIs, full-stack applications, and AI integrations.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 shrink-0">
              {/* Fiverr / Direct Hire Button */}
              <a
                href={socials.fiverr}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/40 transition-all duration-200 active:scale-95"
              >
                <Briefcase className="w-4 h-4" />
                <span>Hire Me on Fiverr</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>

              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-white/10 rounded-xl transition-all"
              >
                <span>Direct Contact</span>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
