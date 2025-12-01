'use client'

import { AppHeader } from '@/components/app-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Users, Calendar, ArrowRight, Wallet, UserPlus, Ghost } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { DashboardSkeleton } from '@/components/skeletons'
import { getUserFriendlyError } from '@/lib/errors'
import { formatLocalDate } from '@/lib/utils'

interface Group {
  id: string
  name: string
  budget: number | null
  exchange_date: string | null
  status: 'PLANNING' | 'DRAWN'
  member_count: number
  is_admin: boolean
}

export default function DashboardPage() {
  const router = useRouter()
  const [groups, setGroups] = useState<Group[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<{ id: string; email: string } | null>(null)

  useEffect(() => {
    const supabase = createClient()

    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser({ id: user.id, email: user.email || '' })
      fetchGroups(user.id)
    }

    checkUser()
  }, [router])

  const fetchGroups = async (userId: string) => {
    const supabase = createClient()

    try {
      // Get groups where user is a member
      const { data: memberGroups, error } = await supabase
        .from('members')
        .select(
          `
          group_id,
          is_admin,
          groups (
            id,
            name,
            budget,
            exchange_date,
            status,
            admin_id
          )
        `
        )
        .eq('user_id', userId)

      if (error) throw error

      if (memberGroups) {
        // Get member counts for each group
        const groupIds = memberGroups.map((mg) => mg.group_id)

        const { data: counts } = await supabase
          .from('members')
          .select('group_id')
          .in('group_id', groupIds)

        const countMap: Record<string, number> = {}
        counts?.forEach((c) => {
          countMap[c.group_id] = (countMap[c.group_id] || 0) + 1
        })

        const formattedGroups: Group[] = memberGroups
          .filter((mg) => mg.groups)
          .map((mg) => {
            const group = mg.groups as unknown as {
              id: string
              name: string
              budget: number | null
              exchange_date: string | null
              status: 'PLANNING' | 'DRAWN'
              admin_id: string
            }
            return {
              id: group.id,
              name: group.name,
              budget: group.budget,
              exchange_date: group.exchange_date,
              status: group.status,
              member_count: countMap[mg.group_id] || 0,
              is_admin: mg.is_admin as boolean,
            }
          })

        setGroups(formattedGroups)
      }
    } catch (error) {
      console.error('Error fetching groups:', error)
      // Show toast with friendly error message
      const friendlyError = getUserFriendlyError(error as { code?: string; message?: string })
      console.error(friendlyError)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AppHeader />
        <main className="container mx-auto px-4 py-8">
          <DashboardSkeleton />
        </main>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-slate-900">Mis Grupos</h1>
            <p className="text-slate-500">
              Gestiona tus intercambios de regalos y listas de deseos.
            </p>
          </div>
          <div className="flex w-full gap-2 md:w-auto">
            <Link href="/join" className="flex-1 md:flex-initial">
              <Button variant="outline" className="w-full gap-2">
                <UserPlus className="h-4 w-4" /> Unirse
              </Button>
            </Link>
            <Link href="/groups/new" className="flex-1 md:flex-initial">
              <Button className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700">
                <Plus className="h-4 w-4" /> Crear Grupo
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <Link key={group.id} href={`/groups/${group.id}`} className="group block">
              <Card className="h-full cursor-pointer border-slate-200 bg-white transition-all hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-100">
                <CardHeader>
                  <CardTitle className="flex items-start justify-between gap-4">
                    <span className="truncate text-xl text-slate-900">{group.name}</span>
                    <span
                      className={`rounded-full border px-2 py-1 text-xs font-medium whitespace-nowrap ${
                        group.status === 'DRAWN'
                          ? 'border-emerald-100 bg-emerald-50 text-emerald-600'
                          : 'border-amber-100 bg-amber-50 text-amber-600'
                      }`}
                    >
                      {group.status === 'DRAWN' ? 'Sorteado' : 'Planificando'}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Users className="h-4 w-4" />
                      <span>{group.member_count} Miembros</span>
                    </div>
                    {group.exchange_date && (
                      <div className="flex items-center gap-2 text-slate-500">
                        <Calendar className="h-4 w-4" />
                        <span>{formatLocalDate(group.exchange_date)}</span>
                      </div>
                    )}
                    {group.budget && (
                      <div className="flex items-center gap-2 text-slate-500">
                        <Wallet className="h-4 w-4" />
                        <span>${group.budget}</span>
                      </div>
                    )}
                    {group.is_admin && (
                      <div className="flex items-center gap-2 text-indigo-500">
                        <Ghost className="h-4 w-4" />
                        <span>Admin</span>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="pt-2">
                  <span className="flex items-center gap-1 text-sm font-medium text-indigo-600 transition-all group-hover:gap-2">
                    Ver Detalles <ArrowRight className="h-4 w-4" />
                  </span>
                </CardFooter>
              </Card>
            </Link>
          ))}

          {groups.length === 0 && !isLoading && (
            <div className="col-span-full py-16 text-center">
              <div className="relative mb-6 inline-flex">
                {/* Background decorative elements */}
                <div className="absolute inset-0 scale-150">
                  <div className="absolute top-1/2 left-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-100/50 blur-xl" />
                  <div className="absolute top-0 right-0 h-8 w-8 rounded-full bg-rose-100 blur-sm" />
                  <div className="absolute bottom-0 left-0 h-6 w-6 rounded-full bg-violet-100 blur-sm" />
                </div>
                {/* Main icon container */}
                <div className="relative flex h-24 w-24 rotate-3 items-center justify-center rounded-2xl border border-indigo-100/50 bg-gradient-to-br from-indigo-50 to-violet-50 shadow-lg shadow-indigo-100/30">
                  <Ghost className="h-12 w-12 text-indigo-500" />
                </div>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-slate-900">
                ¡Bienvenido a GhostSwap!
              </h3>
              <p className="mx-auto mb-6 max-w-md text-slate-500">
                Aún no tienes grupos. Crea tu primer Amigo Secreto y comparte el link con tus
                amigos, o únete a un grupo existente.
              </p>
              <div className="flex flex-col justify-center gap-3 sm:flex-row">
                <Link href="/groups/new">
                  <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="h-4 w-4" />
                    Crear mi primer grupo
                  </Button>
                </Link>
                <Link href="/join">
                  <Button variant="outline" className="gap-2">
                    <UserPlus className="h-4 w-4" />
                    Unirme con código
                  </Button>
                </Link>
              </div>
            </div>
          )}

          <Link href="/groups/new">
            <Button
              variant="outline"
              className="group flex h-auto min-h-[250px] w-full flex-col gap-4 border-2 border-dashed border-slate-200 bg-transparent text-slate-500 hover:border-indigo-300 hover:bg-slate-50 hover:text-indigo-600"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 transition-colors group-hover:bg-indigo-50">
                <Plus className="h-6 w-6 text-slate-400 group-hover:text-indigo-600" />
              </div>
              <span className="text-lg font-medium">Crear nuevo grupo</span>
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
