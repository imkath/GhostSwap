'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AppHeader } from '@/components/app-header'
import { Ghost, Loader2, ArrowLeft, Users, Calendar, CheckCircle } from 'lucide-react'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { formatLocalDate } from '@/lib/utils'

interface GroupPreview {
  id: string
  name: string
  exchange_date: string | null
  member_count: number
}

// Extract valid invite code (12 hex chars) from text that might contain extra content
const extractInviteCode = (input: string): string => {
  // First try to find a 12-char hex string in the input
  const hexMatch = input.match(/[0-9a-f]{12}/i)
  if (hexMatch) {
    return hexMatch[0].toLowerCase()
  }
  // If no valid code found, return the trimmed input (will fail validation later)
  return input.trim()
}

function JoinGroupContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [inviteCode, setInviteCode] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [groupPreview, setGroupPreview] = useState<GroupPreview | null>(null)
  const [joined, setJoined] = useState(false)

  useEffect(() => {
    const rawCode = searchParams.get('code')
    const code = rawCode ? extractInviteCode(rawCode) : null

    if (code) {
      setInviteCode(code)
      // Auto-fetch group preview
      fetchGroupPreview(code)
    }

    const checkAuthAndAutoJoin = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        const redirectUrl = code ? `/join?code=${code}` : '/join'
        router.push(`/login?redirectTo=${encodeURIComponent(redirectUrl)}`)
        return
      }
      setIsCheckingAuth(false)

      // Auto-join if coming with a code (e.g., from invite link after login)
      if (code) {
        autoJoinGroup(code, user.id)
      }
    }
    checkAuthAndAutoJoin()
  }, [searchParams, router])

  const autoJoinGroup = async (code: string, userId: string) => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      // Find group by invite code
      const { data: groupData } = await supabase.rpc('get_group_by_invite_code', { code })

      if (!groupData || groupData.length === 0) {
        setIsLoading(false)
        return // Invalid code, let user try manually
      }

      const group = groupData[0]

      // Check if already a member
      const { data: existingMember } = await supabase
        .from('members')
        .select('id')
        .eq('group_id', group.id)
        .eq('user_id', userId)
        .single()

      if (existingMember) {
        // Already a member, redirect to group
        router.push(`/groups/${group.id}`)
        return
      }

      // Check if group is already drawn
      if (group.status === 'DRAWN') {
        setError('Este grupo ya realizó su sorteo y no acepta nuevos miembros')
        setIsLoading(false)
        return
      }

      // Add user as member
      const { error: joinError } = await supabase.from('members').insert({
        group_id: group.id,
        user_id: userId,
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
        .eq('id', userId)
        .single()

      // Log activity
      await supabase.from('activities').insert({
        group_id: group.id,
        user_id: userId,
        type: 'USER_JOINED',
        message: `${profile?.full_name || 'Alguien'} se unió al grupo`,
      })

      setJoined(true)
      setTimeout(() => {
        router.push(`/groups/${group.id}`)
      }, 1500)
    } catch {
      setIsLoading(false)
    }
  }

  const fetchGroupPreview = async (code: string) => {
    const supabase = createClient()

    const { data, error } = await supabase.rpc('get_group_by_invite_code', { code })

    if (!error && data && data.length > 0) {
      setGroupPreview({
        id: data[0].id,
        name: data[0].name,
        exchange_date: data[0].exchange_date,
        member_count: data[0].member_count,
      })
    }
  }

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (!inviteCode) {
      setError('El código de invitación es requerido')
      setIsLoading(false)
      return
    }

    const supabase = createClient()

    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Find group by invite code
      const { data: groupData } = await supabase.rpc('get_group_by_invite_code', {
        code: inviteCode,
      })

      if (!groupData || groupData.length === 0) {
        setError('Código de invitación inválido')
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
        setError('Este grupo ya realizó su sorteo y no acepta nuevos miembros')
        setIsLoading(false)
        return
      }

      // Add user as member
      const { error: joinError } = await supabase.from('members').insert({
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
      await supabase.from('activities').insert({
        group_id: group.id,
        user_id: user.id,
        type: 'USER_JOINED',
        message: `${profile?.full_name || 'Alguien'} se unió al grupo`,
      })

      setJoined(true)
      setTimeout(() => {
        router.push(`/groups/${group.id}`)
      }, 1500)
    } catch {
      setError('Error de conexión')
      setIsLoading(false)
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  if (joined) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AppHeader />
        <main className="container mx-auto max-w-md px-4 py-8">
          <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-lg">
            <div className="mb-4 inline-flex rounded-full bg-emerald-50 p-3 text-emerald-600">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h1 className="mb-2 text-2xl font-bold text-slate-900">¡Te uniste!</h1>
            <p className="text-slate-500">Redirigiendo al grupo...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />

      <main className="container mx-auto max-w-md px-4 py-8">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="flex items-center text-slate-500 transition-colors hover:text-indigo-600"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a mis grupos
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-lg">
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex rounded-full bg-indigo-50 p-3 text-indigo-600">
              <Ghost className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Unirse a un grupo</h1>
            <p className="mt-2 text-slate-500">Ingresa el código de invitación</p>
          </div>

          {/* Group Preview */}
          {groupPreview && (
            <div className="mb-6 rounded-lg border border-indigo-100 bg-indigo-50 p-4">
              <p className="mb-2 font-medium text-indigo-900">{groupPreview.name}</p>
              <div className="flex gap-4 text-sm text-indigo-600">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {groupPreview.member_count} miembros
                </span>
                {groupPreview.exchange_date && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatLocalDate(groupPreview.exchange_date)}
                  </span>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleJoin} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Código de invitación</label>
              <Input
                placeholder="Ej: a1b2c3d4e5f6"
                className="h-11 font-mono"
                value={inviteCode}
                onChange={(e) => {
                  const value = e.target.value
                  // Extract valid code if user pastes text with extra content
                  const cleanCode = value.length > 12 ? extractInviteCode(value) : value
                  setInviteCode(cleanCode)
                  if (cleanCode.length >= 12) {
                    fetchGroupPreview(cleanCode)
                  } else {
                    setGroupPreview(null)
                  }
                }}
                required
              />
            </div>

            <Button
              type="submit"
              className="h-11 w-full bg-indigo-600 shadow-lg shadow-indigo-200/50 hover:bg-indigo-700"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Unirse al grupo'}
            </Button>
          </form>
        </div>
      </main>
    </div>
  )
}

export default function JoinGroupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      }
    >
      <JoinGroupContent />
    </Suspense>
  )
}
