import Link from "next/link"

export function Footer() {
  return (
    <footer className="py-6 text-center text-slate-500 text-sm bg-white border-t border-slate-200" role="contentinfo">
      <p>&copy; {new Date().getFullYear()} GhostSwap - Amigo Secreto e Intercambio de Regalos</p>
      <nav className="mt-2" aria-label="Enlaces legales">
        <Link href="/privacy" className="hover:text-indigo-600 transition-colors">
          Política de Privacidad
        </Link>
      </nav>
    </footer>
  )
}
