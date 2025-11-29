import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-slate-200" role="banner">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between" aria-label="Navegación principal">
        <Logo />
        <Link href="/login">
          <Button variant="ghost" className="font-medium hover:text-indigo-600 hover:bg-indigo-50 !h-11 px-4">
            Entrar
          </Button>
        </Link>
      </nav>
    </header>
  )
}
