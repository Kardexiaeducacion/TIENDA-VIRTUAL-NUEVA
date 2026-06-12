import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://cloe-app.vercel.app';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/account/', '/checkout/', '/api/', '/editor/', '/auth/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
