"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AppHeader } from "@/components/app-header"
import { Ghost, Loader2, ArrowLeft, Users, Calendar, CheckCircle } from "lucide-react"
import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase"

interface GroupPreview {
  id: string
  name: string
  exchange_date: string | null
  member_count: number
}

function JoinGroupContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [inviteCode, setInviteCode] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [groupPreview, setGroupPreview] = useState<GroupPreview | null>(null)
  const [joined, setJoined] = useState(false)

  useEffect(() => {
    const code = searchParams.get("code")
    if (code) {
      setInviteCode(code)
      // Auto-fetch group preview
      fetchGroupPreview(code)
    }

    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        const redirectUrl = code ? `/join?code=${code}` : '/join'
        router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`)
        return
      }
      setIsCheckingAuth(false)
    }
    checkAuth()
  }, [searchParams, router])

  const fetchGroupPreview = async (code: string) => {
    const supabase = createClient()

    const { data, error } = await supabase
      .rpc('get_group_by_invite_code', { code })

    if (!error && data && data.length > 0) {
      setGroupPreview({
        id: data[0].id,
        name: data[0].name,
        exchange_date: data[0].exchange_date,
        member_count: data[0].member_count
      })
    }
  }

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!inviteCode) {
      setError("El código de invitación es requerido")
      setIsLoading(false)
      return
    }

    const supabase = createClient()

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }

      // Find group by invite code
      const { data: groupData } = await supabase
        .rpc('get_group_by_invite_code', { code: inviteCode })

      if (!groupData || groupData.length === 0) {
        setError("Código de invitación inválido")
        setIsLoading(false)
        return
      }

      const group = groupData[0]

      // Check if already a member
      const { data: existingMember } = await supabase
        .from('members')
        .select('id')
        .eq('group_id', group.id)
        .eq('user_id', user.id)
        .single()

      if (existingMember) {
        // Already a member, redirect to group
        router.push(`/groups/${group.id}`)
        return
      }

      // Check if group is already drawn
      if (group.status === 'DRAWN') {
        setError("Este grupo ya realizó su sorteo y no acepta nuevos miembros")
        setIsLoading(false)
        return
      }

      // Add user as member
      const { error: joinError } = await supabase
        .from('members')
        .insert({
          group_id: group.id,
          user_id: user.id,
          is_admin: false,
        })

      if (joinError) {
        setError(joinError.message)
        setIsLoading(false)
        return
      }

      // Get user profile for activity message
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()

      // Log activity
      await supabase
        .from('activities')
        .insert({
          group_id: group.id,
          user_id: user.id,
          type: 'USER_JOINED',
          message: `${profile?.full_name || 'Alguien'} se unió al grupo`
        })

      setJoined(true)
      setTimeout(() => {
        router.push(`/groups/${group.id}`)
      }, 1500)

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

  if (joined) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AppHeader />
        <main className="container mx-auto px-4 py-8 max-w-md">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100 text-center">
            <div className="inline-flex p-3 rounded-full bg-emerald-50 text-emerald-600 mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">¡Te uniste!</h1>
            <p className="text-slate-500">Redirigiendo al grupo...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />

      <main className="container mx-auto px-4 py-8 max-w-md">
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
            <h1 className="text-2xl font-bold text-slate-900">Unirse a un grupo</h1>
            <p className="text-slate-500 mt-2">Ingresa el código de invitación</p>
          </div>

          {/* Group Preview */}
          {groupPreview && (
            <div className="mb-6 p-4 rounded-lg bg-indigo-50 border border-indigo-100">
              <p className="font-medium text-indigo-900 mb-2">{groupPreview.name}</p>
              <div className="flex gap-4 text-sm text-indigo-600">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {groupPreview.member_count} miembros
                </span>
                {groupPreview.exchange_date && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(groupPreview.exchange_date).toLocaleDateString("es-ES")}
                  </span>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleJoin} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Código de invitación
              </label>
              <Input
                placeholder="Ej: a1b2c3d4e5f6"
                className="h-11 font-mono"
                value={inviteCode}
                onChange={(e) => {
                  setInviteCode(e.target.value)
                  if (e.target.value.length >= 12) {
                    fetchGroupPreview(e.target.value)
                  } else {
                    setGroupPreview(null)
                  }
                }}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200/50"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Unirse al grupo"
              )}
            </Button>
          </form>
        </div>
      </main>
    </div>
  )
}

export default function JoinGroupPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    }>
      <JoinGroupContent />
    </Suspense>
  )
}
