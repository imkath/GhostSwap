import type React from 'react'
import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#4f46e5',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://ghostswap.kthcsk.me'),
  title: {
    default: 'GhostSwap - Organiza tu Amigo Secreto Online Gratis',
    template: '%s | GhostSwap',
  },
  description:
    'Organiza tu Amigo Secreto o intercambio de regalos online gratis con GhostSwap. Sorteos automáticos, listas de deseos y compartir por WhatsApp. La mejor app para Secret Santa en español.',
  keywords: [
    'amigo secreto',
    'amigo secreto online',
    'sorteo amigo secreto',
    'intercambio de regalos',
    'secret santa',
    'secret santa online',
    'sorteo navidad',
    'amigo invisible',
    'intercambio navideño',
    'sorteo de regalos',
    'organizar amigo secreto',
    'app amigo secreto gratis',
  ],
  authors: [{ name: 'GhostSwap' }],
  creator: 'GhostSwap',
  publisher: 'GhostSwap',
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
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://ghostswap.kthcsk.me',
    siteName: 'GhostSwap',
    title: 'GhostSwap - Organiza tu Amigo Secreto Online Gratis',
    description:
      'Organiza tu Amigo Secreto o intercambio de regalos online gratis. Sorteos automáticos, listas de deseos y comparte por WhatsApp.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'GhostSwap - Amigo Secreto Online',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GhostSwap - Organiza tu Amigo Secreto Online Gratis',
    description:
      'Organiza tu Amigo Secreto o intercambio de regalos online gratis. Sorteos automáticos y listas de deseos.',
    images: ['/og-image.png'],
    creator: '@ghostswap',
  },
  alternates: {
    canonical: 'https://ghostswap.kthcsk.me',
    languages: {
      es: 'https://ghostswap.kthcsk.me',
    },
  },
  category: 'technology',
  verification: {
    // google: 'tu-codigo-de-verificacion', // Agregar cuando tengas Google Search Console
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.svg" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} bg-background text-foreground min-h-screen font-sans antialiased`}
      >
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
