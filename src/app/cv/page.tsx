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
      <div
        className="max-w-4xl mx-auto bg-white text-slate-900 p-8 sm:p-12 rounded-2xl shadow-2xl print:shadow-none print:p-0 print:m-0 print:max-w-none print:w-full leading-normal"
        style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
      >
        
        {/* Document Header */}
        <header className="border-b-2 border-slate-800 pb-4 mb-6 text-center">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight uppercase mb-1">
            {personal.fullName}
          </h1>
          <p className="text-sm font-semibold text-slate-700 tracking-wide mb-2">
            {personal.title}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-slate-600">
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-slate-500 inline print:hidden" />
              <a href={`tel:${personal.socials.phone.replace(/[^0-9+]/g, '')}`} className="hover:underline">
                {personal.socials.phone}
              </a>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-slate-500 inline print:hidden" />
              <a href={`mailto:${personal.socials.email}`} className="hover:underline">
                {personal.socials.email}
              </a>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500 inline print:hidden" />
              <span>{personal.location}</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-indigo-700 print:text-slate-800 mt-1.5">
            <a href="https://www.anayem.com" target="_blank" rel="noopener noreferrer" className="hover:underline font-bold text-slate-900">
              anayem.com
            </a>
            <span>•</span>
            <a href={personal.socials.github} target="_blank" rel="noopener noreferrer" className="hover:underline">
              github.com/anayemofficial
            </a>
            <span>•</span>
            <a href={personal.socials.linkedin} target="_blank" rel="noopener noreferrer" className="hover:underline">
              linkedin.com/in/md-abdullah-al-nayem
            </a>
          </div>
        </header>

        {/* SUMMARY */}
        <section className="mb-6">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-1 mb-2">
            Summary
          </h2>
          <p className="text-xs text-slate-800 leading-relaxed">
            {personal.summary}
          </p>
        </section>

        {/* EDUCATION */}
        <section className="mb-6">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-1 mb-3">
            Education
          </h2>
          <div className="space-y-3 text-xs">
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

        {/* ACADEMIC RESEARCH & THESIS */}
        <section className="mb-6">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-1 mb-3">
            Academic Research &amp; Thesis
          </h2>
          <div className="space-y-3 text-xs">
            <div className="pl-1 border-l-2 border-purple-500/40 print:border-slate-300 ml-0.5">
              <div className="pl-2">
                <div className="flex flex-wrap justify-between items-baseline gap-1">
                  <div>
                    <h3 className="font-bold text-slate-900">
                      Privacy-Preserving Skin Disease Classification Using Federated Learning and Explainable Artificial Intelligence
                    </h3>
                    <p className="text-slate-700 italic text-[11px]">
                      Undergraduate Thesis • Daffodil International University (July 2026) • Supervisor: Ms. Tapushe Rabaya Toma, Assistant Professor
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold text-purple-700 print:text-slate-700 bg-purple-50 print:bg-transparent px-1.5 py-0.2 rounded border border-purple-200 print:border-none">
                    Undergraduate Thesis
                  </span>
                </div>
                <div className="text-slate-600 italic text-[11px] mt-0.5">
                  Python, TensorFlow, MobileNetV2, Flower (FLWR), FedAvg, FedProx, Grad-CAM (XAI), Scikit-learn
                </div>
                <ul className="list-disc list-inside text-slate-800 space-y-1 mt-1 pl-1">
                  <li>
                    Designed and evaluated a privacy-preserving federated deep learning framework across 12,684 dermatological images spanning 10 disease categories.
                  </li>
                  <li>
                    Benchmarked deep backbones: Centralized MobileNetV2 achieved <strong>97.75% accuracy</strong> (97.80% precision, 97.75% recall, 97.66% F1).
                  </li>
                  <li>
                    Deployed a 3-client decentralized testbed via <strong>Flower (FLWR)</strong>: FedAvg achieved <strong>65.76% accuracy</strong> under IID data; FedProx achieved <strong>62.61% accuracy</strong> under heterogeneous Non-IID distributions, mitigating client drift via proximal regularization.
                  </li>
                  <li>
                    Integrated <strong>Explainable AI (Grad-CAM)</strong> visual saliency heatmaps to inspect convolutional layer activation and verify anatomical lesion localization without exposing raw patient records.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* PROJECTS */}
        <section className="mb-6">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-1 mb-3">
            Projects
          </h2>

          {/* CLIENT PROJECTS SUBSECTION */}
          <div className="mb-4">
            <h3 className="text-[11px] font-bold text-emerald-800 print:text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>Client Projects</span>
              <span className="text-[10px] font-normal normal-case text-slate-500">(Commercial Deliverables)</span>
            </h3>
            <div className="space-y-3 text-xs pl-1 border-l-2 border-emerald-500/30 print:border-slate-300 ml-0.5">

              {/* MADX */}
              <div className="pl-2">
                <div className="flex flex-wrap justify-between items-baseline gap-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-slate-900">MADX — E-Commerce Platform</h4>
                    <span className="text-[10px] font-semibold text-emerald-700 print:text-slate-700 bg-emerald-50 print:bg-transparent px-1.5 py-0.2 rounded border border-emerald-200 print:border-none">
                      Client Project
                    </span>
                  </div>
                  <a
                    href="https://madx.bd"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-700 print:text-slate-800 hover:underline text-[11px] font-semibold"
                  >
                    https://madx.bd
                  </a>
                </div>
                <div className="text-slate-600 italic text-[11px] mt-0.5">
                  React, Next.js, Node.js, Express.js, Supabase, PostgreSQL, Tailwind CSS, REST API
                </div>
                <ul className="list-disc list-inside text-slate-800 space-y-0.5 mt-1 pl-1">
                  <li>
                    Developed a commercial e-commerce platform for a client with indexed product search, persistent shopping cart state management, and Node.js/Express REST APIs with Supabase PostgreSQL storage.
                  </li>
                </ul>
              </div>

              {/* Krishi Gold */}
              <div className="pl-2">
                <div className="flex flex-wrap justify-between items-baseline gap-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-slate-900">Krishi Gold — Rice Business Website</h4>
                    <span className="text-[10px] font-semibold text-emerald-700 print:text-slate-700 bg-emerald-50 print:bg-transparent px-1.5 py-0.2 rounded border border-emerald-200 print:border-none">
                      Client Project
                    </span>
                  </div>
                  <a
                    href="https://krishigold.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-700 print:text-slate-800 hover:underline text-[11px] font-semibold"
                  >
                    https://krishigold.com
                  </a>
                </div>
                <div className="text-slate-600 italic text-[11px] mt-0.5">
                  Next.js, React, TypeScript, Tailwind CSS, Vercel, Responsive Design
                </div>
                <ul className="list-disc list-inside text-slate-800 space-y-0.5 mt-1 pl-1">
                  <li>
                    Designed and developed a professional rice business website for a client, featuring English and Bengali multilingual presentation, responsive product showcase, and corporate B2B wholesale inquiry channels.
                  </li>
                </ul>
              </div>

            </div>
          </div>

          {/* PERSONAL & ENGINEERING PROJECTS SUBSECTION */}
          <div>
            <h3 className="text-[11px] font-bold text-indigo-800 print:text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>Personal &amp; Engineering Projects</span>
              <span className="text-[10px] font-normal normal-case text-slate-500">(Full-Stack &amp; AI Systems)</span>
            </h3>
            <div className="space-y-3 text-xs pl-1 border-l-2 border-indigo-500/30 print:border-slate-300 ml-0.5">

              {/* Abdullah Al Nayem Personal Portfolio */}
              <div className="pl-2">
                <div className="flex flex-wrap justify-between items-baseline gap-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-slate-900">Abdullah Al Nayem — Personal Portfolio</h4>
                    <span className="text-[10px] font-semibold text-sky-700 print:text-slate-700 bg-sky-50 print:bg-transparent px-1.5 py-0.2 rounded border border-sky-200 print:border-none">
                      Personal Project
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <a
                      href="https://www.anayem.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-700 print:text-slate-800 hover:underline font-semibold"
                    >
                      https://www.anayem.com
                    </a>
                    <span>•</span>
                    <a
                      href="https://github.com/anayemofficial/portfolio"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-700 print:text-slate-800 hover:underline"
                    >
                      GitHub
                    </a>
                  </div>
                </div>
                <div className="text-slate-600 italic text-[11px] mt-0.5">
                  Next.js 16, React 19, TypeScript, Tailwind CSS, Supabase, PostgreSQL, Redis, Zod
                </div>
                <ul className="list-disc list-inside text-slate-800 space-y-0.5 mt-1 pl-1">
                  <li>
                    Designed and developed personal portfolio and micro-blog platform featuring authoritative Supabase PostgreSQL storage, atomic likes stored procedure, double-submit CSRF, and Upstash Redis rate limiting.
                  </li>
                </ul>
              </div>

              {/* Sketch2Design-AI */}
              <div className="pl-2">
                <div className="flex flex-wrap justify-between items-baseline gap-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-slate-900">Sketch2Design-AI</h4>
                    <span className="text-[10px] font-semibold text-purple-700 print:text-slate-700 bg-purple-50 print:bg-transparent px-1.5 py-0.2 rounded border border-purple-200 print:border-none">
                      AI Project
                    </span>
                  </div>
                  <a
                    href="https://github.com/anayemofficial/Sketch2Design-AI"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-700 print:text-slate-800 hover:underline text-[11px]"
                  >
                    github.com/anayemofficial/Sketch2Design-AI
                  </a>
                </div>
                <div className="text-slate-600 italic text-[11px] mt-0.5">
                  React, TypeScript, Vite, Generative AI, Computer Vision, Tailwind CSS
                </div>
                <ul className="list-disc list-inside text-slate-800 space-y-0.5 mt-1 pl-1">
                  <li>
                    AI-powered sketch-to-UI conversion tool transforming hand-drawn paper wireframe sketches into clean, production-ready React and TypeScript components.
                  </li>
                </ul>
              </div>

              {/* Photo Hub */}
              <div className="pl-2">
                <div className="flex flex-wrap justify-between items-baseline gap-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-slate-900">Photo Hub</h4>
                    <span className="text-[10px] font-semibold text-sky-700 print:text-slate-700 bg-sky-50 print:bg-transparent px-1.5 py-0.2 rounded border border-sky-200 print:border-none">
                      Full-Stack
                    </span>
                  </div>
                  <a
                    href="https://github.com/anayemofficial/Photo-Hub"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-700 print:text-slate-800 hover:underline text-[11px]"
                  >
                    github.com/anayemofficial/Photo-Hub
                  </a>
                </div>
                <div className="text-slate-600 italic text-[11px] mt-0.5">
                  JavaScript, Node.js, Express.js, Supabase, PostgreSQL, REST API
                </div>
                <ul className="list-disc list-inside text-slate-800 space-y-0.5 mt-1 pl-1">
                  <li>
                    Web-based photo gallery and media management system with user authentication, photo metadata indexing, and REST APIs.
                  </li>
                </ul>
              </div>

            </div>
          </div>
        </section>

        {/* TECHNICAL SKILLS */}
        <section className="mb-6 text-xs">
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
              <strong className="text-slate-900">Databases &amp; BaaS:</strong> Supabase, PostgreSQL, MySQL
            </p>
            <p>
              <strong className="text-slate-900">Data Science &amp; Analytics:</strong> Data Analysis, Data Visualization, Power BI, Microsoft Excel, Web Scraping, Pandas, PyTorch
            </p>
            <p>
              <strong className="text-slate-900">Tools &amp; Platforms:</strong> Git &amp; GitHub, Microsoft Office Suite, Computer Hardware &amp; OS Troubleshooting
            </p>
          </div>
        </section>

        {/* CERTIFICATIONS */}
        <section className="mb-6 text-xs">
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
        <section className="mb-6 text-xs">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-1 mb-2">
            Leadership &amp; Activities
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
        <section className="text-xs">
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
