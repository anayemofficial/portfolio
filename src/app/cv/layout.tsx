import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Curriculum Vitae & Resume | Abdullah Al Nayem',
  description:
    'Official curriculum vitae and professional resume of Abdullah Al Nayem, Software Engineer and Full-Stack Developer specializing in modern web development, data science, and AI systems.',
  alternates: {
    canonical: '/cv',
  },
  openGraph: {
    title: 'Curriculum Vitae & Resume | Abdullah Al Nayem',
    description:
      'Official curriculum vitae and professional resume of Abdullah Al Nayem, Software Engineer and Full-Stack Developer specializing in modern web development, data science, and AI systems.',
    url: 'https://www.anayem.com/cv',
    siteName: 'Abdullah Al Nayem Portfolio',
    type: 'profile',
    images: [
      {
        url: '/profile.jpg',
        width: 1024,
        height: 1024,
        alt: 'Abdullah Al Nayem - Software Engineer CV',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'Curriculum Vitae & Resume | Abdullah Al Nayem',
    description:
      'Official curriculum vitae and professional resume of Abdullah Al Nayem, Software Engineer and Full-Stack Developer.',
    images: ['/profile.jpg'],
  },
};

export default function CVLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
