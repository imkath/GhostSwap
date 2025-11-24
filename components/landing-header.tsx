import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-slate-200">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Logo />
        <Link href="/login">
          <Button variant="ghost" className="font-medium hover:text-indigo-600 hover:bg-indigo-50">
            Entrar
          </Button>
        </Link>
      </div>
    </header>
  )
}
