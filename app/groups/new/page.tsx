"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AppHeader } from "@/components/app-header"
import { ArrowLeft, Loader2, Ghost, Calendar, DollarSign } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase"

const currencies = [
  { code: 'USD', symbol: '$', name: 'Dólar estadounidense' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'MXN', symbol: '$', name: 'Peso mexicano' },
  { code: 'ARS', symbol: '$', name: 'Peso argentino' },
  { code: 'CLP', symbol: '$', name: 'Peso chileno' },
  { code: 'COP', symbol: '$', name: 'Peso colombiano' },
  { code: 'PEN', symbol: 'S/', name: 'Sol peruano' },
  { code: 'BRL', symbol: 'R$', name: 'Real brasileño' },
  { code: 'GBP', symbol: '£', name: 'Libra esterlina' },
]

export default function NewGroupPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [budget, setBudget] = useState("")
  const [currency, setCurrency] = useState("USD")
  const [eventDate, setEventDate] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }
      setIsCheckingAuth(false)
    }
    checkAuth()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const supabase = createClient()

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }

      // Create group
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .insert({
          name,
          admin_id: user.id,
          budget: budget ? parseFloat(budget) : null,
          currency,
          exchange_date: eventDate || null,
        })
        .select()
        .single()

      if (groupError) {
        setError(groupError.message)
        setIsLoading(false)
        return
      }

      // Add creator as member (admin)
      const { error: memberError } = await supabase
        .from('members')
        .insert({
          group_id: group.id,
          user_id: user.id,
          is_admin: true,
        })

      if (memberError) {
        setError(memberError.message)
        setIsLoading(false)
        return
      }

      // Log activity
      await supabase
        .from('activities')
        .insert({
          group_id: group.id,
          user_id: user.id,
          type: 'GROUP_CREATED',
          message: `Grupo "${name}" creado`
        })

      router.push(`/groups/${group.id}`)
    } catch {
      setError("Error de conexión")
      setIsLoading(false)
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  const selectedCurrency = currencies.find(c => c.code === currency)

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          <Link href="/dashboard" className="flex items-center text-slate-500 hover:text-indigo-600 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a mis grupos
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-full bg-indigo-50 text-indigo-600 mb-4">
              <Ghost className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Crear nuevo grupo</h1>
            <p className="text-slate-500 mt-2">Organiza tu intercambio de regalos</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Nombre del grupo *
              </label>
              <Input
                placeholder="Ej: Navidad Familia 2024"
                className="h-11"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center">
                <DollarSign className="w-4 h-4 mr-1" />
                Presupuesto
              </label>
              <div className="flex gap-2">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="h-11 px-3 rounded-md border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {currencies.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} ({c.symbol})
                    </option>
                  ))}
                </select>
                <Input
                  type="number"
                  placeholder={`Ej: 25`}
                  className="h-11 flex-1"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                />
              </div>
              {selectedCurrency && (
                <p className="text-xs text-slate-500">{selectedCurrency.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                Fecha del evento
              </label>
              <Input
                type="date"
                className="h-11"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200/50"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Crear grupo"
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
