"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Gift, Loader2, ArrowLeft, CheckCircle, Eye, EyeOff } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    // Check if user has a valid session from the callback
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        // No valid session, redirect to forgot password
        router.push('/forgot-password?error=invalid_session')
        return
      }

      setIsCheckingSession(false)
    }

    checkSession()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      setIsLoading(false)
      return
    }

    try {
      const { error: supabaseError } = await supabase.auth.updateUser({
        password: password,
      })

      if (supabaseError) {
        setError(supabaseError.message)
        setIsLoading(false)
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    } catch {
      setError("Error al actualizar la contraseña")
    } finally {
      setIsLoading(false)
    }
  }

  if (isCheckingSession) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </main>
    )
  }

  if (success) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-slate-50">
        <div className="w-full max-w-[400px] bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 text-center">
          <div className="inline-flex p-3 rounded-full bg-green-50 text-green-600 mb-4">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Contraseña actualizada</h1>
          <p className="text-slate-500 mb-6">
            Tu contraseña ha sido actualizada exitosamente. Serás redirigido al inicio de sesión...
          </p>
          <Link href="/login">
            <Button variant="outline" className="w-full">
              Ir al inicio de sesión
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
          <h1 className="text-2xl font-bold text-slate-900">Nueva contraseña</h1>
          <p className="text-slate-500">Ingresa tu nueva contraseña</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Nueva contraseña"
              className="h-11 bg-white border-slate-300 text-slate-900 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500 pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Confirmar contraseña"
            className="h-11 bg-white border-slate-300 text-slate-900 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
              "Actualizar contraseña"
            )}
          </Button>
        </form>
      </div>
    </main>
  )
}
