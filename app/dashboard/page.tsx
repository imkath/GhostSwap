"use client"

import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Users, Calendar, ArrowRight, Wallet, UserPlus, Ghost } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { DashboardSkeleton } from "@/components/skeletons"
import { getUserFriendlyError } from "@/lib/errors"

interface Group {
  id: string
  name: string
  budget: number | null
  exchange_date: string | null
  status: "PLANNING" | "DRAWN"
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
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
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
        .select(`
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
        `)
        .eq('user_id', userId)

      if (error) throw error

      if (memberGroups) {
        // Get member counts for each group
        const groupIds = memberGroups.map(mg => mg.group_id)

        const { data: counts } = await supabase
          .from('members')
          .select('group_id')
          .in('group_id', groupIds)

        const countMap: Record<string, number> = {}
        counts?.forEach(c => {
          countMap[c.group_id] = (countMap[c.group_id] || 0) + 1
        })

        const formattedGroups: Group[] = memberGroups
          .filter(mg => mg.groups)
          .map(mg => ({
            id: mg.groups.id,
            name: mg.groups.name,
            budget: mg.groups.budget,
            exchange_date: mg.groups.exchange_date,
            status: mg.groups.status,
            member_count: countMap[mg.group_id] || 0,
            is_admin: mg.is_admin
          }))

        setGroups(formattedGroups)
      }
    } catch (error) {
      console.error("Error fetching groups:", error)
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
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-slate-900">Mis Grupos</h1>
            <p className="text-slate-500">Gestiona tus intercambios de regalos y listas de deseos.</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Link href="/join" className="flex-1 md:flex-initial">
              <Button variant="outline" className="w-full gap-2">
                <UserPlus className="w-4 h-4" /> Unirse
              </Button>
            </Link>
            <Link href="/groups/new" className="flex-1 md:flex-initial">
              <Button className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-4 h-4" /> Crear Grupo
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <Link key={group.id} href={`/groups/${group.id}`} className="block group">
              <Card className="h-full hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-100 transition-all cursor-pointer bg-white border-slate-200">
                <CardHeader>
                  <CardTitle className="flex justify-between items-start gap-4">
                    <span className="truncate text-xl text-slate-900">{group.name}</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium border whitespace-nowrap
                      ${
                        group.status === "DRAWN"
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                          : "bg-amber-50 text-amber-600 border-amber-100"
                      }`}
                    >
                      {group.status === "DRAWN" ? "Sorteado" : "Planificando"}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Users className="w-4 h-4" />
                      <span>{group.member_count} Miembros</span>
                    </div>
                    {group.exchange_date && (
                      <div className="flex items-center gap-2 text-slate-500">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(group.exchange_date).toLocaleDateString("es-ES")}</span>
                      </div>
                    )}
                    {group.budget && (
                      <div className="flex items-center gap-2 text-slate-500">
                        <Wallet className="w-4 h-4" />
                        <span>${group.budget}</span>
                      </div>
                    )}
                    {group.is_admin && (
                      <div className="flex items-center gap-2 text-indigo-500">
                        <Ghost className="w-4 h-4" />
                        <span>Admin</span>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="pt-2">
                  <span className="text-sm font-medium text-indigo-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                    Ver Detalles <ArrowRight className="w-4 h-4" />
                  </span>
                </CardFooter>
              </Card>
            </Link>
          ))}

          {groups.length === 0 && !isLoading && (
            <div className="col-span-full text-center py-16">
              <div className="relative inline-flex mb-6">
                {/* Background decorative elements */}
                <div className="absolute inset-0 scale-150">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-indigo-100/50 blur-xl" />
                  <div className="absolute top-0 right-0 w-8 h-8 rounded-full bg-rose-100 blur-sm" />
                  <div className="absolute bottom-0 left-0 w-6 h-6 rounded-full bg-violet-100 blur-sm" />
                </div>
                {/* Main icon container */}
                <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 flex items-center justify-center rotate-3 border border-indigo-100/50 shadow-lg shadow-indigo-100/30">
                  <Ghost className="w-12 h-12 text-indigo-500" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">¡Bienvenido a GhostSwap!</h3>
              <p className="text-slate-500 mb-6 max-w-md mx-auto">
                Aún no tienes grupos. Crea tu primer Amigo Secreto y comparte el link con tus amigos, o únete a un grupo existente.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/groups/new">
                  <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2">
                    <Plus className="w-4 h-4" />
                    Crear mi primer grupo
                  </Button>
                </Link>
                <Link href="/join">
                  <Button variant="outline" className="gap-2">
                    <UserPlus className="w-4 h-4" />
                    Unirme con código
                  </Button>
                </Link>
              </div>
            </div>
          )}

          <Link href="/groups/new">
            <Button
              variant="outline"
              className="h-auto min-h-[250px] w-full flex flex-col gap-4 border-dashed border-2 border-slate-200 hover:bg-slate-50 hover:border-indigo-300 group bg-transparent text-slate-500 hover:text-indigo-600"
            >
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                <Plus className="w-6 h-6 text-slate-400 group-hover:text-indigo-600" />
              </div>
              <span className="font-medium text-lg">Crear nuevo grupo</span>
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
