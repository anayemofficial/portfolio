import type { Metadata } from 'next';
import { Background } from '@/components/Background';
import { Navbar } from '@/components/Navbar';
import { Blog } from '@/components/Blog';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Blog & Daily Logs | Abdullah Nayem',
  description:
    'Daily life updates, political & social thoughts, tech notes, and personal reflections by Abdullah Nayem.',
  openGraph: {
    title: 'Daily Thoughts & Blog | Abdullah Nayem',
    description:
      'Daily life updates, political & social thoughts, tech notes, and personal reflections by Abdullah Nayem.',
    url: 'https://abdullah-nayem.dev/blog',
    siteName: 'Abdullah Nayem Blog',
    type: 'website',
  },
};

export default function BlogPage() {
  return (
    <main className="relative min-h-screen bg-[#090d16] text-slate-100 overflow-x-hidden selection:bg-indigo-600 selection:text-white pt-20 sm:pt-24 pb-12">
      {/* Dynamic Ambient Background */}
      <Background />

      {/* Navigation Header */}
      <Navbar isBlogPage />

      {/* Main Blog Section with Cover Photo */}
      <Blog />

      {/* Footer */}
      <Footer />
    </main>
  );
}
