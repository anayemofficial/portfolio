'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Code2, ArrowUpRight, ArrowLeft } from 'lucide-react';
import { portfolioData } from '@/data/portfolioData';

export type ActiveView =
  | 'home'
  | 'about'
  | 'skills'
  | 'projects'
  | 'experience'
  | 'education'
  | 'contact';

export interface NavItem {
  label: string;
  view: ActiveView;
  href: string;
}

export const navItems: NavItem[] = [
  { label: 'Home', view: 'home', href: '/' },
  { label: 'About', view: 'about', href: '/?view=about' },
  { label: 'Skills', view: 'skills', href: '/?view=skills' },
  { label: 'Projects', view: 'projects', href: '/?view=projects' },
  { label: 'Experience', view: 'experience', href: '/?view=experience' },
  { label: 'Education', view: 'education', href: '/?view=education' },
  { label: 'Contact', view: 'contact', href: '/?view=contact' },
];

interface NavbarProps {
  isBlogPage?: boolean;
  activeView?: ActiveView;
  onViewChange?: (view: ActiveView) => void;
}

export function Navbar({
  isBlogPage = false,
  activeView = 'home',
  onViewChange,
}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || isBlogPage
          ? 'bg-[#090d16]/85 backdrop-blur-md border-b border-white/10 py-3 shadow-xl'
          : 'bg-[#090d16]/60 backdrop-blur-sm py-4 border-b border-white/5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            onClick={(e) => {
              if (onViewChange) {
                e.preventDefault();
                onViewChange('home');
              }
            }}
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

          {/* When on dedicated subpage (like /blog or /projects/[slug]), show Back to Portfolio */}
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
              {/* Desktop Single-View Navigation Pills */}
              <nav className="hidden lg:flex items-center gap-1 glass-panel px-3 py-1.5 rounded-full border border-white/10 shadow-inner">
                {navItems.map((item) => {
                  const isActive = activeView === item.view;
                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      onClick={(e) => {
                        if (onViewChange) {
                          e.preventDefault();
                          onViewChange(item.view);
                        }
                      }}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-indigo-600/40 text-indigo-200 border border-indigo-500/50 shadow-sm shadow-indigo-500/20 font-semibold'
                          : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                      )}
                      <span>{item.label}</span>
                    </a>
                  );
                })}
              </nav>

              {/* Top CTA Button: Let's Talk only (CV and Blog removed per Section 2) */}
              <div className="hidden lg:flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    if (onViewChange) {
                      onViewChange('contact');
                    } else {
                      window.location.href = '/?view=contact';
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-sky-600 rounded-lg hover:from-indigo-500 hover:to-sky-500 shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/40 transition-all duration-200 active:scale-95 cursor-pointer"
                >
                  <span>Let's Talk</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Mobile / Tablet Menu Toggle Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg bg-slate-900/80 border border-white/10 text-slate-300 hover:text-white focus:outline-none"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {!isBlogPage && mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[65px] bg-[#090d16]/95 backdrop-blur-xl border-b border-white/10 px-6 py-6 transition-all duration-300 shadow-2xl max-h-[calc(100vh-70px)] overflow-y-auto">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive = activeView === item.view;
              return (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => {
                    if (onViewChange) {
                      e.preventDefault();
                      onViewChange(item.view);
                    }
                    setMobileMenuOpen(false);
                  }}
                  className={`px-4 py-2.5 text-sm font-medium rounded-xl transition-all flex items-center justify-between ${
                    isActive
                      ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 font-semibold'
                      : 'text-slate-200 hover:bg-indigo-600/20 hover:text-indigo-300 border border-transparent'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-500/30 text-indigo-300 border border-indigo-500/40">
                      Active
                    </span>
                  )}
                </a>
              );
            })}

            {/* Mobile Let's Talk Button */}
            <div className="pt-4 border-t border-white/10 mt-2 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => {
                  if (onViewChange) {
                    onViewChange('contact');
                  } else {
                    window.location.href = '/?view=contact';
                  }
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-sky-600 rounded-xl shadow-lg shadow-indigo-600/30 cursor-pointer"
              >
                <span>Let's Talk</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
