'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Code2, ArrowUpRight, BookOpen, ArrowLeft, FileText } from 'lucide-react';
import { portfolioData } from '@/data/portfolioData';

const navItems = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Projects', href: '#projects' },
  { label: 'Services', href: '#services' },
  { label: 'Education', href: '#education' },
];

interface NavbarProps {
  isBlogPage?: boolean;
}

export function Navbar({ isBlogPage = false }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(isBlogPage ? 'blog' : 'home');

  useEffect(() => {
    if (isBlogPage) return;

    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }

      // Simple active section detection
      const sections = navItems.map((item) => item.href.substring(1));
      const scrollPosition = window.scrollY + 200;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const top = element.offsetTop;
          const height = element.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isBlogPage]);

  const resolveHref = (href: string) => {
    if (isBlogPage && href.startsWith('#')) {
      return `/${href}`;
    }
    return href;
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || isBlogPage
          ? 'bg-[#090d16]/85 backdrop-blur-md border-b border-white/10 py-3 shadow-xl'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            href={isBlogPage ? '/' : '#home'}
            className="flex items-center gap-2.5 group transition-transform duration-200 hover:scale-105"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-sky-500 to-emerald-400 p-[1px] shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-[#090d16] rounded-[11px] flex items-center justify-center">
                <Code2 className="w-5 h-5 text-indigo-400 group-hover:text-sky-300 transition-colors" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight text-white group-hover:text-indigo-300 transition-colors">
                {portfolioData.personal.name}
              </span>
              <span className="text-[10px] text-slate-400 font-mono tracking-wide uppercase -mt-1">
                Software Engineer
              </span>
            </div>
          </Link>

          {/* When on Blog page, keep header ultra clean with just a Back to Portfolio button */}
          {isBlogPage ? (
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-white/10 hover:border-indigo-500/40 rounded-xl transition-all shadow-sm active:scale-95 group"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-indigo-400 group-hover:-translate-x-1 transition-transform" />
                <span>Back to Portfolio</span>
              </Link>
            </div>
          ) : (
            <>
              {/* Desktop Navigation Links */}
              <nav className="hidden md:flex items-center gap-1 glass-panel px-4 py-1.5 rounded-full border border-white/10 shadow-inner">
                {navItems.map((item) => {
                  const isActive = activeSection === item.href.substring(1);
                  return (
                    <a
                      key={item.label}
                      href={resolveHref(item.href)}
                      className={`px-3.5 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${
                        isActive
                          ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 shadow-sm'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {item.label}
                    </a>
                  );
                })}
              </nav>

              {/* CTA Buttons: CV + Blog + Let's Talk */}
              <div className="hidden md:flex items-center gap-2.5">
                {/* CV / Resume Button */}
                <Link
                  href="/cv"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 hover:border-indigo-500/40 hover:text-white transition-all duration-200 active:scale-95 shadow-sm"
                  title="View Official CV"
                >
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                  <span>CV</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
                </Link>

                {/* Separate Blog Button */}
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 hover:border-indigo-500/50 hover:shadow-indigo-500/20 transition-all duration-200 active:scale-95 shadow-sm"
                  title="Open Daily Blog & Thoughts"
                >
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Blog</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
                </Link>

                {/* Let's Talk Button */}
                <a
                  href="#contact"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-sky-600 rounded-lg hover:from-indigo-500 hover:to-sky-500 shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/40 transition-all duration-200 active:scale-95"
                >
                  <span>Let's Talk</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Mobile Menu Toggle Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg bg-slate-900/80 border border-white/10 text-slate-300 hover:text-white focus:outline-none"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay for Home page */}
      {!isBlogPage && mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[65px] bg-[#090d16]/95 backdrop-blur-xl border-b border-white/10 px-6 py-6 transition-all duration-300 shadow-2xl">
          <div className="flex flex-col gap-3">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={resolveHref(item.href)}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-indigo-600/20 hover:text-indigo-300 rounded-lg transition-colors border border-transparent hover:border-indigo-500/20"
              >
                {item.label}
              </a>
            ))}

            {/* Mobile Action Buttons */}
            <div className="pt-4 border-t border-white/10 mt-2 flex flex-col gap-2.5">
              {/* Mobile CV Button */}
              <Link
                href="/cv"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl border transition-colors bg-slate-800/90 text-slate-200 border-white/10 hover:bg-slate-700 hover:text-white"
              >
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>View Official CV</span>
                <ArrowUpRight className="w-4 h-4 opacity-70" />
              </Link>

              {/* Separate Mobile Blog Button */}
              <Link
                href="/blog"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl border transition-colors bg-indigo-600/15 text-indigo-300 border-indigo-500/30 hover:bg-indigo-600/25"
              >
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <span>Daily Blog & Thoughts</span>
                <ArrowUpRight className="w-4 h-4 opacity-70" />
              </Link>

              {/* Mobile Let's Talk Button */}
              <a
                href="#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-sky-600 rounded-xl shadow-lg shadow-indigo-600/30"
              >
                <span>Let's Talk</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
