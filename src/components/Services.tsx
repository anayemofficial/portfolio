'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Layers, Layout, Server, BarChart2, Brain, Globe, CheckCircle2, ArrowRight } from 'lucide-react';
import { portfolioData } from '@/data/portfolioData';

const serviceIconMap: Record<string, React.ElementType> = {
  Layers,
  Layout,
  Server,
  BarChart2,
  Brain,
  Globe,
};

export function Services() {
  const { services } = portfolioData;

  return (
    <section id="services" className="py-20 px-4 sm:px-6 lg:px-8 relative bg-slate-950/40 border-y border-white/5">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="flex flex-col items-start mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono text-xs font-medium mb-3">
            <span>// SERVICES & CAPABILITIES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            What I Can Build <span className="text-gradient">& Solve For You</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mt-2">
            Delivering clean, robust software engineering solutions—from responsive client interfaces to intelligent backend & data services.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => {
            const IconComponent = serviceIconMap[service.icon] || Layers;
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-6 rounded-2xl glass-card border border-white/10 hover:border-indigo-500/40 transition-all duration-300 flex flex-col justify-between group hover:shadow-xl hover:shadow-indigo-500/10"
              >
                <div>
                  <div className="p-3 w-fit rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 mb-5">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                    {service.title}
                  </h3>
                  
                  <p className="text-xs text-slate-300 mb-6 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Key Deliverables Bullet Points */}
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    {service.deliverables.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-400">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Service Bottom Contact CTA Link */}
                <div className="pt-6 mt-6 border-t border-white/5">
                  <a
                    href="#contact"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    <span>Discuss a Project</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
