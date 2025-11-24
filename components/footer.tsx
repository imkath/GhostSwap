import Link from "next/link"

export function Footer() {
  return (
    <footer className="py-6 text-center text-slate-400 text-sm bg-white border-t border-slate-200">
      <p>&copy; {new Date().getFullYear()} GhostSwap - Amigo Secreto e Intercambio de Regalos</p>
      <div className="mt-2">
        <Link href="/privacy" className="hover:text-indigo-600 transition-colors">
          Política de Privacidad
        </Link>
      </div>
    </footer>
  )
}
