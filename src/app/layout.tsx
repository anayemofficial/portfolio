import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { portfolioData } from '@/data/portfolioData';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Abdullah Nayem | Full-Stack Developer & Data Science Enthusiast',
  description:
    'Abdullah Nayem is a Full-Stack Developer and Software Engineering graduate specializing in modern web development, data science, AI, and scalable digital products.',
  keywords: [
    'Abdullah Nayem',
    'Full-Stack Developer',
    'Data Science',
    'AI Enthusiast',
    'Software Engineer Bangladesh',
    'React Developer',
    'Next.js Developer',
    'Node.js REST API',
    'PyTorch Machine Learning',
    'Daffodil International University',
  ],
  authors: [{ name: 'Abdullah Nayem' }],
  creator: 'Abdullah Nayem',
  metadataBase: new URL('https://abdullah-nayem.dev'),
  openGraph: {
    title: 'Abdullah Nayem | Full-Stack Developer & Data Science Enthusiast',
    description:
      'Full-Stack Developer building scalable web applications and intelligent digital experiences. Experienced in React, Next.js, Node.js, Python, and PyTorch.',
    url: 'https://abdullah-nayem.dev',
    siteName: 'Abdullah Nayem Portfolio',
    images: [
      {
        url: '/profile.jpg',
        width: 1200,
        height: 630,
        alt: 'Abdullah Nayem - Full-Stack Developer & Data Science Enthusiast',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Abdullah Nayem | Full-Stack Developer & Data Science Enthusiast',
    description:
      'Full-Stack Developer building scalable web applications and intelligent digital experiences.',
    images: ['/profile.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // JSON-LD Structured Data Schema for Person
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: portfolioData.personal.name,
    jobTitle: portfolioData.personal.title,
    alumniOf: portfolioData.personal.university,
    url: 'https://abdullah-nayem.dev',
    sameAs: [
      portfolioData.personal.socials.github,
      portfolioData.personal.socials.linkedin,
    ],
    knowsAbout: portfolioData.personal.coreAreas,
  };

  return (
    <html lang="en" className={`scroll-smooth dark ${plusJakartaSans.variable} ${jetbrainsMono.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-[#090d16] text-slate-100 font-sans antialiased selection:bg-indigo-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
