import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Layers,
  Terminal,
  Sparkles,
  FlaskConical,
  Zap,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  FolderGit2,
} from 'lucide-react';
import { GithubIcon } from '@/components/Icons';
import { Background } from '@/components/Background';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import {
  portfolioData,
  getAllProjectSlugs,
  getProjectBySlug,
  Project,
} from '@/data/portfolioData';

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllProjectSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    return {
      title: 'Project Not Found | Abdullah Al Nayem',
      description: 'The requested project case study could not be found.',
    };
  }

  const title = `${project.title} — Case Study | Abdullah Al Nayem`;
  const description =
    project.description.length > 155
      ? `${project.description.slice(0, 152)}...`
      : project.description;
  const canonicalUrl = `https://www.anayem.com/projects/${project.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: `/projects/${project.slug}`,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Abdullah Al Nayem Portfolio',
      type: 'article',
      images: [
        {
          url: '/profile.jpg',
          width: 1024,
          height: 1024,
          alt: `${project.title} - Case Study by Abdullah Al Nayem`,
        },
      ],
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: ['/profile.jpg'],
    },
  };
}

export default async function ProjectCaseStudyPage({
  params,
}: ProjectPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  // Calculate previous and next projects for contextual internal linking
  const projects = portfolioData.projects;
  const currentIndex = projects.findIndex((p) => p.slug === project.slug);
  const prevProject =
    currentIndex > 0 ? projects[currentIndex - 1] : projects[projects.length - 1];
  const nextProject =
    currentIndex < projects.length - 1 ? projects[currentIndex + 1] : projects[0];

  // Schema.org Structured Data
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.anayem.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Projects',
        item: 'https://www.anayem.com/#projects',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: project.title,
        item: `https://www.anayem.com/projects/${project.slug}`,
      },
    ],
  };

  // Context-appropriate entity structured data
  const getEntitySchema = (p: Project) => {
    if (p.id === 'skin-disease-classification') {
      return {
        '@context': 'https://schema.org',
        '@type': 'Thesis',
        name: p.title,
        headline: p.tagline,
        description: p.description,
        author: {
          '@type': 'Person',
          name: 'Abdullah Al Nayem',
          url: 'https://www.anayem.com',
        },
        inLanguage: 'en',
        about: [
          'Federated Learning',
          'Explainable AI',
          'Deep Learning',
          'Skin Disease Classification',
        ],
        sourceOrganization: {
          '@type': 'EducationalOrganization',
          name: 'Daffodil International University',
        },
        url: `https://www.anayem.com/projects/${p.slug}`,
      };
    }

    if (p.id === 'krishi-gold') {
      return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: p.title,
        description: p.description,
        url: p.liveUrl || `https://www.anayem.com/projects/${p.slug}`,
        creator: {
          '@type': 'Person',
          name: 'Abdullah Al Nayem',
          url: 'https://www.anayem.com',
        },
      };
    }

    if (p.id === 'health-super-app') {
      return {
        '@context': 'https://schema.org',
        '@type': 'CreativeWork',
        name: p.title,
        headline: p.tagline,
        description: p.description,
        creator: {
          '@type': 'Person',
          name: 'Abdullah Al Nayem',
          url: 'https://www.anayem.com',
        },
        url: `https://www.anayem.com/projects/${p.slug}`,
      };
    }

    if (p.id === 'scientific-calculator') {
      return {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: p.title,
        description: p.description,
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Windows, macOS, Linux',
        author: {
          '@type': 'Person',
          name: 'Abdullah Al Nayem',
          url: 'https://www.anayem.com',
        },
        url: `https://www.anayem.com/projects/${p.slug}`,
        ...(p.githubUrl ? { codeRepository: p.githubUrl } : {}),
      };
    }

    // Default for interactive software applications
    return {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: p.title,
      description: p.description,
      applicationCategory:
        p.category === 'AI / Data Science'
          ? 'DeveloperApplication'
          : 'BusinessApplication',
      operatingSystem: 'All',
      author: {
        '@type': 'Person',
        name: 'Abdullah Al Nayem',
        url: 'https://www.anayem.com',
      },
      url: p.liveUrl || `https://www.anayem.com/projects/${p.slug}`,
      ...(p.githubUrl ? { codeRepository: p.githubUrl } : {}),
    };
  };

  const entitySchema = getEntitySchema(project);

  const renderStatusBadge = (status: Project['currentStatus']) => {
    switch (status) {
      case 'Live Platform':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Live Platform</span>
          </span>
        );
      case 'Completed Project':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/40">
            <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
            <span>Completed Project</span>
          </span>
        );
      case 'Research Project':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/40">
            <FlaskConical className="w-3.5 h-3.5 text-purple-400" />
            <span>Research Project</span>
          </span>
        );
      case 'Product Concept':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Product Concept</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <main className="relative min-h-screen bg-[#090d16] text-slate-100 overflow-x-hidden selection:bg-indigo-600 selection:text-white pt-20 sm:pt-24 pb-16">
      {/* Dynamic Ambient Background */}
      <Background />

      {/* Clean Header Navigation */}
      <Navbar isBlogPage />

      {/* Structured Data Scripts */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(entitySchema) }}
      />

      <article className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 font-sans">
        {/* 1. Breadcrumb Trail & Back Shortcut */}
        <nav
          aria-label="Breadcrumbs"
          className="flex items-center justify-between flex-wrap gap-3 pb-6 text-xs font-mono text-slate-400 border-b border-white/5"
        >
          <ol className="flex items-center gap-1.5 flex-wrap">
            <li>
              <Link href="/" className="hover:text-white transition-colors">
                Home
              </Link>
            </li>
            <li>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            </li>
            <li>
              <Link href="/#projects" className="hover:text-white transition-colors">
                Projects
              </Link>
            </li>
            <li>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            </li>
            <li className="text-indigo-400 font-semibold truncate max-w-[220px] sm:max-w-none">
              {project.title}
            </li>
          </ol>

          <Link
            href="/#projects"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 text-xs transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-indigo-400" />
            <span>Back to Projects</span>
          </Link>
        </nav>

        {/* 2. Project Header Hero */}
        <header className="py-8 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-mono font-semibold">
              {project.category}
            </span>
            {project.projectType && (
              <span
                className={`px-3 py-1 rounded-full text-xs font-mono font-semibold border ${
                  project.projectType === 'Client Project'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : project.projectType === 'Personal Project'
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                    : 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                }`}
              >
                {project.projectType}
              </span>
            )}
            {renderStatusBadge(project.currentStatus)}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            {project.title}
          </h1>

          <p className="text-sm sm:text-base font-mono text-indigo-300 leading-relaxed max-w-3xl">
            {project.tagline}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-4">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
              >
                <span>Visit Live Platform</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-white/10 text-xs sm:text-sm font-semibold transition-all active:scale-95"
              >
                <GithubIcon className="w-4 h-4" />
                <span>GitHub Repository</span>
              </a>
            )}
          </div>
        </header>

        {/* 3. Detailed Case Study Sections */}
        <section className="space-y-8 pt-4">
          {/* Detailed Architectural Overview Card */}
          <div
            className={`p-6 sm:p-8 rounded-2xl border ${
              project.isFlagship
                ? 'bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border-emerald-500/40'
                : 'bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border-indigo-500/30'
            } shadow-2xl space-y-3`}
          >
            <div className="flex items-center gap-2 text-xs font-mono text-indigo-400">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="uppercase font-bold tracking-wider">
                Comprehensive Case Study Overview
              </span>
            </div>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
              {project.detailedOverview}
            </p>
          </div>

          {/* Problem & Solution Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-rose-500/30 space-y-3 shadow-lg">
              <h2 className="text-sm font-bold text-rose-400 font-mono flex items-center gap-2 uppercase tracking-wide">
                <AlertCircle className="w-4 h-4" />
                The Challenge &amp; Problem
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {project.problem}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-emerald-500/30 space-y-3 shadow-lg">
              <h2 className="text-sm font-bold text-emerald-400 font-mono flex items-center gap-2 uppercase tracking-wide">
                <CheckCircle2 className="w-4 h-4" />
                The Engineering Solution
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {project.solution}
              </p>
            </div>
          </div>

          {/* Role & Leadership Responsibilities */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-white/10 space-y-3 shadow-lg">
            <h2 className="text-sm font-bold text-indigo-400 font-mono flex items-center gap-2 uppercase tracking-wide">
              <Layers className="w-4 h-4" />
              Role &amp; Responsibilities
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {project.role}
            </p>
          </div>

          {/* Technology Stack Grid */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-white/10 space-y-4 shadow-lg">
            <h2 className="text-sm font-bold text-white font-mono flex items-center gap-2 uppercase tracking-wide">
              <Cpu className="w-4 h-4 text-sky-400" />
              Technology Stack &amp; Architecture
            </h2>
            <div className="flex flex-wrap gap-2">
              {project.techStack.map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1.5 text-xs font-mono rounded-lg bg-indigo-950/70 border border-indigo-500/30 text-indigo-300"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Key Features Implemented */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-white/10 space-y-4 shadow-lg">
            <h2 className="text-sm font-bold text-white font-mono flex items-center gap-2 uppercase tracking-wide">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Key Features &amp; Implementation Details
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-300">
              {project.features.map((feature, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-white/5 leading-relaxed"
                >
                  <span className="text-indigo-400 font-mono font-bold shrink-0 mt-0.5">
                    •
                  </span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Development Process Timeline */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-white/10 space-y-4 shadow-lg">
            <h2 className="text-sm font-bold text-white font-mono flex items-center gap-2 uppercase tracking-wide">
              <Terminal className="w-4 h-4 text-amber-400" />
              Development &amp; Engineering Process
            </h2>
            <div className="space-y-2.5">
              {project.developmentProcess.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/50 border border-white/5 text-xs sm:text-sm text-slate-300"
                >
                  <span className="w-6 h-6 rounded-full bg-slate-800 border border-white/10 text-indigo-400 flex items-center justify-center font-mono text-xs font-bold shrink-0">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Engineering Challenges */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-white/10 space-y-4 shadow-lg">
            <h2 className="text-sm font-bold text-rose-400 font-mono uppercase tracking-wide">
              Key Engineering Challenges Overcome
            </h2>
            <div className="space-y-3 text-xs sm:text-sm text-slate-300">
              {project.challenges.map((challenge, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/20 leading-relaxed"
                >
                  {challenge}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Previous / Next Project Navigation Footer */}
        <footer className="pt-12 mt-12 border-t border-white/10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href={`/projects/${prevProject.slug}`}
              className="p-5 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-white/10 hover:border-indigo-500/40 transition-all group flex flex-col items-start gap-1 text-left"
            >
              <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1 group-hover:-translate-x-1 transition-transform">
                <ArrowLeft className="w-3.5 h-3.5 text-indigo-400" />
                Previous Project
              </span>
              <span className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                {prevProject.title}
              </span>
            </Link>

            <Link
              href={`/projects/${nextProject.slug}`}
              className="p-5 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-white/10 hover:border-indigo-500/40 transition-all group flex flex-col items-end gap-1 text-right"
            >
              <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Next Project
                <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
              </span>
              <span className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                {nextProject.title}
              </span>
            </Link>
          </div>

          <div className="text-center pt-8">
            <Link
              href="/#projects"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 text-xs font-mono transition-colors"
            >
              <FolderGit2 className="w-4 h-4 text-indigo-400" />
              <span>Explore All Projects on Homepage</span>
            </Link>
          </div>
        </footer>
      </article>

      {/* Footer */}
      <Footer />
    </main>
  );
}
