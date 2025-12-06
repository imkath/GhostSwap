import Link from 'next/link'
import { Briefcase } from 'lucide-react'

export function Footer() {
  return (
    <footer
      className="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-500"
      role="contentinfo"
    >
      <p>&copy; {new Date().getFullYear()} GhostSwap - Amigo Secreto e Intercambio de Regalos</p>
      <nav className="mt-3 flex items-center justify-center gap-4" aria-label="Enlaces del sitio">
        <Link
          href="/business"
          className="inline-flex items-center gap-1.5 transition-colors hover:text-indigo-600"
        >
          <Briefcase className="h-3.5 w-3.5" />
          Para Empresas
        </Link>
        <span className="text-slate-300">|</span>
        <Link href="/privacy" className="transition-colors hover:text-indigo-600">
          Política de Privacidad
        </Link>
      </nav>
    </footer>
  )
}
