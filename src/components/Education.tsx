'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Award, CheckCircle2, ShieldCheck, Users, Globe } from 'lucide-react';
import { portfolioData } from '@/data/portfolioData';

export function Education() {
  const { education, certifications, leadership, personal } = portfolioData;

  return (
    <section id="education" className="py-20 px-4 sm:px-6 lg:px-8 relative bg-slate-950/40 border-y border-white/5">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Section Header */}
        <div className="flex flex-col items-start">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono text-xs font-medium mb-3">
            <span>// EDUCATION & CERTIFICATIONS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Academic Degree & <span className="text-gradient">Professional Training</span>
          </h2>
        </div>

        {/* 1. Education Degrees Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {education.degrees.map((deg, idx) => (
            <motion.div
              key={deg.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="p-6 rounded-2xl glass-card border border-white/10 flex flex-col justify-between hover:border-indigo-500/40 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    {deg.period}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-indigo-300 transition-colors">
                  {deg.title}
                </h3>
                <p className="text-xs font-semibold text-indigo-400 mb-3">{deg.institution}</p>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Result:</span>
                <span className="font-bold text-emerald-400">{deg.result}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 2. Certifications Section */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <h3 className="text-xl font-bold text-white tracking-tight">Professional Certifications</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {certifications.map((cert, i) => (
              <motion.div
                key={cert.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="p-5 rounded-xl glass-card border border-white/10 hover:border-indigo-500/30 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Certified
                    </span>
                    <Award className="w-4 h-4 text-amber-400" />
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">{cert.title}</h4>
                  <p className="text-xs text-indigo-400 font-mono mb-2">{cert.issuer}</p>
                  {cert.description && (
                    <p className="text-xs text-slate-400 leading-relaxed">{cert.description}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* 3. Leadership & Languages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          
          {/* Leadership & Activities */}
          <div className="p-6 rounded-2xl glass-card border border-white/10 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-sky-400" />
              <h3 className="text-lg font-bold text-white">Leadership & Activities</h3>
            </div>
            <div className="space-y-3">
              {leadership.map((item, index) => (
                <div key={index} className="p-3 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">{item.role}</div>
                    <div className="text-[11px] text-slate-400">{item.organization}</div>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                </div>
              ))}
            </div>
          </div>

          {/* Spoken Languages */}
          <div className="p-6 rounded-2xl glass-card border border-white/10 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-bold text-white">Languages</h3>
            </div>
            <div className="space-y-3">
              {personal.languages.map((lang) => (
                <div key={lang.name} className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between font-mono text-xs">
                  <span className="font-bold text-white">{lang.name}</span>
                  <span className="text-indigo-400">{lang.proficiency}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
