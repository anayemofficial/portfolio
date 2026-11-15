import { MetadataRoute } from 'next';
import { portfolioData } from '@/data/portfolioData';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.anayem.com';

  const projectRoutes: MetadataRoute.Sitemap = portfolioData.projects.map((project) => ({
    url: `${baseUrl}/projects/${project.slug}`,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/cv`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...projectRoutes,
  ];
}
