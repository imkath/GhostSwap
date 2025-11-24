import type React from "react"
import { Inter, JetBrains_Mono } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans"
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono"
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased min-h-screen bg-background text-foreground`}>
        {children}
      </body>
    </html>
  )
}

export const metadata = {
  title: 'GhostSwap - Amigo Secreto y Sorteos de Regalos',
  description: 'Organiza tu Amigo Secreto o intercambio de regalos con GhostSwap. Sorteos invisibles, regalos inolvidables. La mejor app para Secret Santa.',
  keywords: ['amigo secreto', 'intercambio de regalos', 'secret santa', 'sorteo', 'regalos navidad'],
};
