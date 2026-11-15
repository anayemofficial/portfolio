import type { Metadata } from 'next';
import './globals.css';
import { portfolioData } from '@/data/portfolioData';

export const metadata: Metadata = {
  title: 'Abdullah Al Nayem | Full-Stack Developer & Data Science Enthusiast',
  description:
    'Full-Stack Developer & Software Engineering graduate specializing in modern web development, data science, AI systems, and scalable digital products.',
  keywords: [
    'Abdullah Al Nayem',
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
  authors: [{ name: 'Abdullah Al Nayem' }],
  creator: 'Abdullah Al Nayem',
  metadataBase: new URL('https://www.anayem.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Abdullah Al Nayem | Full-Stack Developer & Data Science Enthusiast',
    description:
      'Full-Stack Developer building scalable web applications and intelligent digital experiences. Experienced in React, Next.js, Node.js, Python, and PyTorch.',
    url: 'https://www.anayem.com',
    siteName: 'Abdullah Al Nayem Portfolio',
    images: [
      {
        url: '/profile.jpg',
        width: 1024,
        height: 1024,
        alt: 'Abdullah Al Nayem - Full-Stack Developer & Software Engineer',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Abdullah Al Nayem | Full-Stack Developer & Data Science Enthusiast',
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
  // JSON-LD Structured Data Schema (@graph combining Person, WebSite, and ProfilePage)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': 'https://www.anayem.com/#person',
        name: portfolioData.personal.name,
        jobTitle: portfolioData.personal.title,
        image: 'https://www.anayem.com/profile.jpg',
        url: 'https://www.anayem.com',
        alumniOf: {
          '@type': 'EducationalOrganization',
          name: portfolioData.personal.university,
        },
        sameAs: [
          portfolioData.personal.socials.github,
          portfolioData.personal.socials.linkedin,
          portfolioData.personal.socials.facebook,
          portfolioData.personal.socials.instagram,
          portfolioData.personal.socials.fiverr,
        ],
        knowsAbout: portfolioData.personal.coreAreas,
      },
      {
        '@type': 'WebSite',
        '@id': 'https://www.anayem.com/#website',
        url: 'https://www.anayem.com',
        name: 'Abdullah Al Nayem Portfolio',
        description:
          'Full-Stack Developer building scalable web applications and intelligent digital experiences.',
        publisher: {
          '@id': 'https://www.anayem.com/#person',
        },
      },
      {
        '@type': 'ProfilePage',
        '@id': 'https://www.anayem.com/#profilepage',
        url: 'https://www.anayem.com',
        name: 'Abdullah Al Nayem | Full-Stack Developer & Data Science Enthusiast',
        mainEntity: {
          '@id': 'https://www.anayem.com/#person',
        },
      },
    ],
  };

  return (
    <html lang="en" className="scroll-smooth dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
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
