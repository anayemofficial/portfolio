'use client';

import React from 'react';
import { Printer, ArrowLeft, Mail, Phone, MapPin } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '@/components/Icons';
import { portfolioData } from '@/data/portfolioData';

export default function CVPage() {
  const { personal, education, projects, certifications, leadership } = portfolioData;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      {/* Top Action Header (Hidden when printing) */}
      <div className="max-w-4xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-4 print:hidden">
        <a
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors border border-white/10"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Portfolio</span>
        </a>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Print or Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Official ATS-Friendly Printable Resume Document Sheet */}
      <div className="max-w-4xl mx-auto bg-white text-slate-900 p-8 sm:p-12 rounded-2xl shadow-2xl print:shadow-none print:p-0 print:m-0 print:max-w-none print:w-full font-serif leading-normal">
        
        {/* Document Header */}
        <header className="border-b-2 border-slate-800 pb-4 mb-6 text-center">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans uppercase mb-1">
            {personal.fullName}
          </h1>
          <p className="text-sm font-semibold text-slate-700 font-sans tracking-wide mb-2">
            {personal.title}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-slate-600 font-sans">
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-slate-500 inline print:hidden" />
              <span>{personal.socials.phone}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-slate-500 inline print:hidden" />
              <span>{personal.socials.email}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500 inline print:hidden" />
              <span>{personal.location}</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-indigo-700 font-sans mt-1">
            <span>github.com/anayemofficial</span>
            <span>•</span>
            <span>linkedin.com/in/md-abdullah-al-nayem</span>
          </div>
        </header>

        {/* SUMMARY */}
        <section className="mb-6">
          <h2 className="text-xs font-bold font-sans text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-1 mb-2">
            Summary
          </h2>
          <p className="text-xs text-slate-800 leading-relaxed font-sans">
            {personal.summary}
          </p>
        </section>

        {/* EDUCATION */}
        <section className="mb-6">
          <h2 className="text-xs font-bold font-sans text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-1 mb-3">
            Education
          </h2>
          <div className="space-y-3 font-sans text-xs">
            {education.degrees.map((deg) => (
              <div key={deg.title} className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-900">{deg.title}</h3>
                  <p className="text-slate-700 italic">{deg.institution}</p>
                  <p className="text-slate-600 font-mono text-[11px]">• {deg.result}</p>
                </div>
                <span className="font-semibold text-slate-700 shrink-0">{deg.period}</span>
              </div>
            ))}
          </div>
        </section>

        {/* PROJECTS */}
        <section className="mb-6">
          <h2 className="text-xs font-bold font-sans text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-1 mb-3">
            Projects
          </h2>
          <div className="space-y-3 font-sans text-xs">
            {projects.slice(0, 4).map((proj) => (
              <div key={proj.id}>
                <div className="flex justify-between items-baseline">
                  <h3 className="font-bold text-slate-900">{proj.title}</h3>
                  <span className="text-slate-600 italic text-[11px]">
                    {proj.techStack.slice(0, 4).join(', ')}
                  </span>
                </div>
                <ul className="list-disc list-inside text-slate-800 space-y-0.5 mt-0.5 pl-1">
                  <li>{proj.description}</li>
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* TECHNICAL SKILLS */}
        <section className="mb-6 font-sans text-xs">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-1 mb-2">
            Technical Skills
          </h2>
          <div className="space-y-1 text-slate-800">
            <p>
              <strong className="text-slate-900">Programming Languages:</strong> Python, Java, JavaScript, C, TypeScript
            </p>
            <p>
              <strong className="text-slate-900">Web Technologies:</strong> HTML5, CSS3, React.js, TypeScript, Vite, Next.js, Node.js, Express.js
            </p>
            <p>
              <strong className="text-slate-900">Databases & BaaS:</strong> Supabase, PostgreSQL, MySQL
            </p>
            <p>
              <strong className="text-slate-900">Data Science & Analytics:</strong> Data Analysis, Data Visualization, Power BI, Microsoft Excel, Web Scraping, Pandas, PyTorch
            </p>
            <p>
              <strong className="text-slate-900">Tools & Platforms:</strong> Git & GitHub, Microsoft Office Suite, Computer Hardware & OS Troubleshooting
            </p>
          </div>
        </section>

        {/* CERTIFICATIONS */}
        <section className="mb-6 font-sans text-xs">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-1 mb-2">
            Certifications
          </h2>
          <ul className="list-disc list-inside text-slate-800 space-y-1 pl-1">
            {certifications.map((cert) => (
              <li key={cert.title}>
                <strong className="text-slate-900">{cert.title}</strong> — {cert.issuer}
                {cert.description && <span className="text-slate-600 text-[11px]"> ({cert.description})</span>}
              </li>
            ))}
          </ul>
        </section>

        {/* LEADERSHIP & ACTIVITIES */}
        <section className="mb-6 font-sans text-xs">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-1 mb-2">
            Leadership & Activities
          </h2>
          <ul className="list-disc list-inside text-slate-800 space-y-1 pl-1">
            {leadership.map((item, idx) => (
              <li key={idx}>
                <strong className="text-slate-900">{item.role}</strong>, {item.organization}
              </li>
            ))}
          </ul>
        </section>

        {/* LANGUAGES */}
        <section className="font-sans text-xs">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-1 mb-2">
            Languages
          </h2>
          <p className="text-slate-800">
            <strong>English:</strong> Fluent in reading, writing, and speaking &nbsp;•&nbsp; <strong>Bengali:</strong> Native
          </p>
        </section>

      </div>
    </div>
  );
}
