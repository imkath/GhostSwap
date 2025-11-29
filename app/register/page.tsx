'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Gift, Loader2, ArrowLeft, Eye, EyeOff, Mail } from 'lucide-react'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/dashboard'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      setIsLoading(false)
      return
    }

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
          data: {
            name,
          },
        },
      })

      if (error) {
        setError(error.message)
        setIsLoading(false)
        return
      }

      setEmailSent(true)
    } catch {
      setError('Error de conexión')
      setIsLoading(false)
    }
  }

  if (emailSent) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-[400px] rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-xl shadow-slate-200/50">
          <div className="mb-4 inline-flex rounded-full bg-green-50 p-3 text-green-600">
            <Mail className="h-8 w-8" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-slate-900">¡Revisa tu correo!</h1>
          <p className="mb-6 text-slate-500">
            Hemos enviado un enlace de confirmación a <strong>{email}</strong>. Haz clic en el
            enlace para activar tu cuenta.
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
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
      <div className="absolute top-4 left-4 md:top-8 md:left-8">
        <Link
          href="/login"
          className="flex items-center text-slate-500 transition-colors hover:text-indigo-600"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Link>
      </div>

      <div className="w-full max-w-[400px] rounded-2xl border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/50">
        <div className="mb-8 space-y-2 text-center">
          <div className="mb-2 inline-flex rounded-full bg-indigo-50 p-3 text-indigo-600">
            <Gift className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Crear cuenta</h1>
          <p className="text-slate-500">Regístrate para organizar tus intercambios</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <Input
            type="text"
            placeholder="Nombre completo"
            className="h-11 border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            type="email"
            placeholder="nombre@ejemplo.com"
            className="h-11 border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Contraseña"
              className="h-11 border-slate-300 bg-white pr-10 text-slate-900 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-2 flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center p-2 text-slate-500 hover:text-slate-700"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <div className="relative">
            <Input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirmar contraseña"
              className="h-11 border-slate-300 bg-white pr-10 text-slate-900 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute top-1/2 right-2 flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center p-2 text-slate-500 hover:text-slate-700"
              aria-label={showConfirmPassword ? 'Ocultar confirmación' : 'Mostrar confirmación'}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <Button
            type="submit"
            className="h-11 w-full bg-indigo-600 shadow-lg shadow-indigo-200/50 hover:bg-indigo-700"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Crear cuenta'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          ¿Ya tienes cuenta?{' '}
          <Link
            href={`/login${redirectTo !== '/dashboard' ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`}
            className="text-indigo-600 underline hover:text-indigo-700"
          >
            Inicia sesión
          </Link>
        </p>
      </div>
    </main>
  )
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </main>
      }
    >
      <RegisterForm />
    </Suspense>
  )
}
