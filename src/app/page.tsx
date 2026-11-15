'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Background } from '@/components/Background';
import { Navbar, ActiveView } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { About } from '@/components/About';
import { Skills } from '@/components/Skills';
import { Services } from '@/components/Services';
import { Projects } from '@/components/Projects';
import { GithubSection } from '@/components/GithubSection';
import { Experience } from '@/components/Experience';
import { Education } from '@/components/Education';
import { FreelanceCTA } from '@/components/FreelanceCTA';
import { Contact } from '@/components/Contact';
import { Blog } from '@/components/Blog';
import { Footer } from '@/components/Footer';
import { portfolioData } from '@/data/portfolioData';

const validViews: ActiveView[] = [
  'home',
  'about',
  'skills',
  'projects',
  'experience',
  'education',
  'contact',
];

function isValidView(val: string): val is ActiveView {
  return validViews.includes(val as ActiveView);
}

function parseViewFromUrl(): ActiveView {
  if (typeof window === 'undefined') return 'home';

  const params = new URLSearchParams(window.location.search);
  const viewParam = params.get('view')?.toLowerCase();
  if (viewParam) {
    if (viewParam === 'services') return 'skills';
    if (viewParam === 'blog') return 'home'; // Blog is now integrated into Home view
    if (isValidView(viewParam)) return viewParam;
  }

  const hash = window.location.hash.replace('#', '').toLowerCase();
  if (hash) {
    if (hash === 'services') return 'skills';
    if (hash === 'blog' || hash === 'blog-section') return 'home';
    if (isValidView(hash)) return hash;
  }

  return 'home';
}

export default function Home() {
  const [activeView, setActiveView] = useState<ActiveView>('home');

  useEffect(() => {
    // Read view from URL on initial client hydration
    const initialView = parseViewFromUrl();
    setActiveView(initialView);

    // If initial navigation was targeted to blog (?view=blog or #blog), smooth scroll to it
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const isBlogTarget =
        params.get('view')?.toLowerCase() === 'blog' ||
        window.location.hash.toLowerCase().includes('blog');
      if (isBlogTarget) {
        setTimeout(() => {
          const el =
            document.getElementById('blog-feed') ||
            document.getElementById('blog-section');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }, 150);
      }
    }

    // Listen to browser Back / Forward buttons
    const handlePopState = () => {
      setActiveView(parseViewFromUrl());
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleViewChange = (view: ActiveView) => {
    setActiveView(view);
    const newUrl = view === 'home' ? '/' : `/?view=${view}`;
    window.history.pushState({ view }, '', newUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'about':
        return (
          <div className="pt-16 sm:pt-20 pb-12">
            <About />
          </div>
        );
      case 'skills':
        return (
          <div className="pt-16 sm:pt-20 pb-12 space-y-12">
            <Skills />
            <Services />
          </div>
        );
      case 'projects':
        return (
          <div className="pt-16 sm:pt-20 pb-12 space-y-12">
            <Projects />
            <GithubSection />
          </div>
        );
      case 'experience':
        return (
          <div className="pt-16 sm:pt-20 pb-12">
            <Experience />
          </div>
        );
      case 'education':
        return (
          <div className="pt-16 sm:pt-20 pb-12">
            <Education />
          </div>
        );
      case 'contact':
        return (
          <div className="pt-16 sm:pt-20 pb-12 space-y-8">
            <FreelanceCTA />
            <Contact />
          </div>
        );
      case 'home':
      default:
        return <Blog heroSection={<Hero onNavigate={handleViewChange} />} />;
    }
  };

  return (
    <main className="relative min-h-screen bg-[#090d16] text-slate-100 overflow-x-hidden selection:bg-indigo-600 selection:text-white flex flex-col justify-between">
      {/* Dynamic Ambient Background */}
      <Background />

      {/* Navigation Header */}
      <Navbar activeView={activeView} onViewChange={handleViewChange} />

      {/* Main Single-View Display Container with Smooth Transition */}
      <div className="flex-1 w-full min-h-[calc(100vh-140px)]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="w-full"
          >
            {renderActiveView()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Search Engine & Accessibility Crawl Index: Ensures all 8 project case studies and section links are present in initial server HTML */}
      <div className="sr-only" aria-hidden="false">
        <nav aria-label="Portfolio Index">
          <h2>Portfolio Projects &amp; Case Studies</h2>
          <ul>
            {portfolioData.projects.map((project) => (
              <li key={project.id}>
                <Link href={`/projects/${project.slug}`}>
                  {project.title} Case Study
                </Link>
                <p>{project.description}</p>
              </li>
            ))}
          </ul>
          <h2>Portfolio Views</h2>
          <ul>
            <li>
              <Link href="/?view=about">About Abdullah Al Nayem</Link>
            </li>
            <li>
              <Link href="/?view=skills">Technical Skills &amp; Capabilities</Link>
            </li>
            <li>
              <Link href="/?view=projects">Featured Projects</Link>
            </li>
            <li>
              <Link href="/?view=experience">Professional Experience</Link>
            </li>
            <li>
              <Link href="/?view=education">Academic Education</Link>
            </li>
            <li>
              <Link href="/?view=contact">Contact Abdullah Al Nayem</Link>
            </li>
            <li>
              <Link href="/blog">Blog &amp; Daily Thoughts</Link>
            </li>
            <li>
              <Link href="/cv">Official Curriculum Vitae</Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Footer */}
      <Footer onViewChange={handleViewChange} />
    </main>
  );
}
