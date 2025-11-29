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
    sitemap: 'https://ghostswap.kthcsk.me/sitemap.xml',
  }
}
