'use client';

import React from 'react';
import { Background } from '@/components/Background';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { About } from '@/components/About';
import { Skills } from '@/components/Skills';
import { Projects } from '@/components/Projects';
import { Services } from '@/components/Services';
import { Experience } from '@/components/Experience';
import { Education } from '@/components/Education';
import { GithubSection } from '@/components/GithubSection';
import { FreelanceCTA } from '@/components/FreelanceCTA';
import { Contact } from '@/components/Contact';
import { Footer } from '@/components/Footer';

export default function Home() {
  return (
    <main className="relative min-h-screen bg-[#090d16] text-slate-100 overflow-x-hidden selection:bg-indigo-600 selection:text-white">
      {/* Dynamic Ambient Background */}
      <Background />

      {/* Navigation Header */}
      <Navbar />

      {/* Main Sections */}
      <Hero />
      <About />
      <Skills />
      <Projects />
      <Services />
      <Experience />
      <Education />
      <GithubSection />
      <FreelanceCTA />
      <Contact />

      {/* Footer */}
      <Footer />
    </main>
  );
}
