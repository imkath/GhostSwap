import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/auth/', '/dashboard', '/groups/'],
      },
    ],
    sitemap: 'https://ghostswap-phi.vercel.app/sitemap.xml',
  }
}
