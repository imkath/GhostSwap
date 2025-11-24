"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Gift, Loader2, ArrowLeft, Mail } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const { error: supabaseError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      })

      if (supabaseError) {
        setError(supabaseError.message)
        setIsLoading(false)
        return
      }

      setSent(true)
    } catch {
      setError("Error de conexión")
    } finally {
      setIsLoading(false)
    }
  }

  if (sent) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-slate-50">
        <div className="w-full max-w-[400px] bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 text-center">
          <div className="inline-flex p-3 rounded-full bg-green-50 text-green-600 mb-4">
            <Mail className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Revisa tu correo</h1>
          <p className="text-slate-500 mb-6">
            Si existe una cuenta con el correo <strong>{email}</strong>, recibirás un enlace para restablecer tu contraseña.
          </p>
          <Link href="/login">
            <Button variant="outline" className="w-full">
              Volver al inicio de sesión
            </Button>
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-slate-50">
      <div className="absolute top-4 left-4 md:top-8 md:left-8">
        <Link href="/login" className="flex items-center text-slate-500 hover:text-indigo-600 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Link>
      </div>

      <div className="w-full max-w-[400px] bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex p-3 rounded-full bg-indigo-50 text-indigo-600 mb-2">
            <Gift className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Recuperar contraseña</h1>
          <p className="text-slate-500">Te enviaremos un enlace para restablecer tu contraseña</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <Input
            type="email"
            placeholder="nombre@ejemplo.com"
            className="h-11 bg-white border-slate-300 text-slate-900 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Button
            type="submit"
            className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200/50"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Enviar enlace"
            )}
          </Button>
        </form>

        <p className="text-sm text-center text-slate-500 mt-6">
          ¿Recordaste tu contraseña?{" "}
          <Link href="/login" className="text-indigo-600 hover:text-indigo-700">
            Inicia sesión
          </Link>
        </p>
      </div>
    </main>
  )
}
