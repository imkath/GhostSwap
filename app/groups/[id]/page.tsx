"use client"

import { AppHeader } from "@/components/app-header"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  CheckCircle2,
  Clock,
  Calendar,
  Wallet,
  Users,
  AlertCircle,
  Gift,
  Loader2,
  ArrowLeft,
  Shuffle,
  Ghost,
  Eye,
  EyeOff,
  Share2,
  Copy,
  Check
} from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase"
import { drawNames } from "@/app/actions/draw"
import { WishlistEditor } from "@/components/wishlist-editor"

interface Member {
  id: string
  user_id: string
  wishlist: Array<{ description: string; url?: string }>
  is_admin: boolean
  profile: {
    full_name: string | null
    email: string
    avatar_url: string | null
  }
}

interface Match {
  receiver_id: string
  receiver: {
    full_name: string | null
    email: string
    avatar_url: string | null
  }
  receiver_wishlist: Array<{ description: string; url?: string }>
}

interface Group {
  id: string
  name: string
  budget: number | null
  exchange_date: string | null
  status: "PLANNING" | "DRAWN"
  invite_code: string
  admin_id: string
}

export default function GroupPage() {
  const params = useParams()
  const router = useRouter()
  const groupId = params.id as string

  const [group, setGroup] = useState<Group | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [currentMember, setCurrentMember] = useState<Member | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)

  // Match reveal state
  const [match, setMatch] = useState<Match | null>(null)
  const [showMatch, setShowMatch] = useState(false)

  useEffect(() => {
    fetchGroupData()
  }, [groupId])

  const fetchGroupData = async () => {
    const supabase = createClient()

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }
      setCurrentUserId(user.id)

      // Get group
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .eq('id', groupId)
        .single()

      if (groupError || !groupData) {
        setError("Grupo no encontrado")
        setIsLoading(false)
        return
      }

      setGroup(groupData)
      setIsAdmin(groupData.admin_id === user.id)

      // Get members with profiles
      const { data: membersData } = await supabase
        .from('members')
        .select(`
          id,
          user_id,
          wishlist,
          is_admin,
          profiles:user_id (
            full_name,
            email,
            avatar_url
          )
        `)
        .eq('group_id', groupId)

      if (membersData) {
        const formattedMembers = membersData.map(m => ({
          id: m.id,
          user_id: m.user_id,
          wishlist: m.wishlist || [],
          is_admin: m.is_admin,
          profile: m.profiles
        }))
        setMembers(formattedMembers)

        // Set current member
        const myMember = formattedMembers.find(m => m.user_id === user.id)
        if (myMember) {
          setCurrentMember(myMember)
        }
      }

      // If group is drawn, get current user's match
      if (groupData.status === 'DRAWN') {
        const { data: matchData } = await supabase
          .from('matches')
          .select(`
            receiver_id,
            receiver:receiver_id (
              full_name,
              email,
              avatar_url
            )
          `)
          .eq('group_id', groupId)
          .eq('giver_id', user.id)
          .single()

        if (matchData) {
          // Get receiver's wishlist
          const { data: receiverMember } = await supabase
            .from('members')
            .select('wishlist')
            .eq('group_id', groupId)
            .eq('user_id', matchData.receiver_id)
            .single()

          setMatch({
            receiver_id: matchData.receiver_id,
            receiver: matchData.receiver,
            receiver_wishlist: receiverMember?.wishlist || []
          })
        }
      }

    } catch {
      setError("Error al cargar el grupo")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDraw = async () => {
    if (!group) return
    setIsDrawing(true)
    setError("")

    const result = await drawNames(group.id)

    if (!result.success) {
      setError(result.error || "Error al realizar el sorteo")
    } else {
      // Reload data to get match
      await fetchGroupData()
    }

    setIsDrawing(false)
  }

  const handleShare = async () => {
    if (!group) return
    const inviteUrl = `${window.location.origin}/join?code=${group.invite_code}`

    const shareData = {
      title: `Únete a ${group.name}`,
      text: `¡Te han invitado al intercambio de regalos "${group.name}"!`,
      url: inviteUrl,
    }

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData)
        return
      } catch (err) {
        if ((err as Error).name === 'AbortError') return
      }
    }

    await navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AppHeader />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      </div>
    )
  }

  if (error && !group) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AppHeader />
        <main className="container mx-auto px-4 py-8 max-w-md">
          <div className="bg-white rounded-xl p-8 border border-slate-200 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Error</h2>
            <p className="text-slate-500 mb-4">{error}</p>
            <Link href="/dashboard">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al dashboard
              </Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  if (!group) return null

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <AppHeader />

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Back Link */}
        <div className="mb-6">
          <Link href="/dashboard" className="flex items-center text-slate-500 hover:text-indigo-600 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a mis grupos
          </Link>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3 text-slate-900">
                {group.name}
                <Badge
                  className={group.status === "DRAWN"
                    ? "bg-emerald-500 hover:bg-emerald-600"
                    : "bg-amber-500 hover:bg-amber-600"
                  }
                >
                  {group.status === "DRAWN" ? "Sorteado" : "Planificando"}
                </Badge>
              </h1>
            </div>

            <div className="flex gap-2">
              {/* Share/Invite Button */}
              <Button
                variant="outline"
                onClick={handleShare}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    ¡Copiado!
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 mr-2" />
                    Invitar
                  </>
                )}
              </Button>

              {/* Draw Button - Only for admin in PLANNING */}
              {isAdmin && group.status === "PLANNING" && members.length >= 3 && (
                <Button
                  onClick={handleDraw}
                  disabled={isDrawing}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {isDrawing ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Shuffle className="w-4 h-4 mr-2" />
                  )}
                  Sortear
                </Button>
              )}
            </div>
          </div>

          {/* Group Info */}
          <div className="flex flex-wrap gap-4 md:gap-6 text-sm text-slate-500">
            {group.exchange_date && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(group.exchange_date).toLocaleDateString("es-ES")}</span>
              </div>
            )}
            {group.budget && (
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                <span>${group.budget}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{members.length} participantes</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[2fr,1fr] gap-8">
          {/* Main Content */}
          <div className="space-y-6">
            {/* PLANNING State - Waiting for draw */}
            {group.status === "PLANNING" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ghost className="w-5 h-5 text-indigo-600" />
                    Esperando el sorteo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-500 mb-4">
                    El grupo está en fase de planificación. Una vez que todos se unan, el administrador realizará el sorteo.
                  </p>
                  {isAdmin && members.length < 3 && (
                    <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                      <p className="text-sm text-amber-700">
                        Necesitas al menos 3 participantes para realizar el sorteo.
                        Actualmente tienes {members.length}.
                      </p>
                    </div>
                  )}
                  {isAdmin && members.length >= 3 && (
                    <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-200">
                      <p className="text-sm text-indigo-700">
                        ¡Ya puedes realizar el sorteo! Haz clic en el botón "Sortear" arriba.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* DRAWN State - Show match reveal card */}
            {group.status === "DRAWN" && match && (
              <Card className="border-indigo-200 bg-gradient-to-br from-white to-indigo-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="w-5 h-5 text-indigo-600" />
                    Tu Amigo Secreto
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!showMatch ? (
                    <div className="text-center py-8">
                      <div className="inline-flex p-4 rounded-full bg-indigo-100 mb-4">
                        <Ghost className="w-12 h-12 text-indigo-600" />
                      </div>
                      <p className="text-slate-500 mb-4">
                        Tu objetivo ha sido asignado. ¿Listo para descubrirlo?
                      </p>
                      <Button
                        size="lg"
                        onClick={() => setShowMatch(true)}
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Revelar Amigo Secreto
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-14 w-14 border-2 border-indigo-200">
                            <AvatarImage src={match.receiver.avatar_url || "/placeholder.svg"} />
                            <AvatarFallback className="bg-indigo-100 text-indigo-600 text-lg">
                              {match.receiver.full_name?.charAt(0) || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold text-lg text-slate-900">
                              {match.receiver.full_name || match.receiver.email}
                            </p>
                            <p className="text-sm text-slate-500">{match.receiver.email}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowMatch(false)}
                        >
                          <EyeOff className="w-4 h-4" />
                        </Button>
                      </div>

                      {match.receiver_wishlist.length > 0 && (
                        <div className="mt-4 p-4 rounded-lg bg-white border border-slate-200">
                          <p className="text-sm font-medium text-slate-700 mb-3">Lista de deseos:</p>
                          <ul className="space-y-2">
                            {match.receiver_wishlist.map((item, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
                                <Gift className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                                <span>
                                  {item.description}
                                  {item.url && (
                                    <a
                                      href={item.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="ml-2 text-indigo-600 hover:underline"
                                    >
                                      (ver enlace)
                                    </a>
                                  )}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {match.receiver_wishlist.length === 0 && (
                        <p className="text-sm text-slate-400 italic">
                          Esta persona no ha agregado artículos a su lista de deseos.
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Wishlist Editor */}
            {currentMember && (
              <Card>
                <CardContent className="pt-6">
                  <WishlistEditor
                    groupId={groupId}
                    memberId={currentMember.id}
                    initialItems={currentMember.wishlist}
                    onSave={fetchGroupData}
                  />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Participants */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Participantes
                  <Badge variant="outline">{members.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border border-slate-200">
                          <AvatarImage src={member.profile.avatar_url || "/placeholder.svg"} />
                          <AvatarFallback className="bg-slate-100 text-slate-600 text-xs">
                            {member.profile.full_name?.charAt(0) || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <span className={
                          member.user_id === currentUserId
                            ? "font-medium text-indigo-600 text-sm"
                            : "text-sm text-slate-700"
                        }>
                          {member.user_id === currentUserId ? "Tú" : member.profile.full_name || member.profile.email}
                        </span>
                        {member.is_admin && (
                          <Ghost className="w-3 h-3 text-indigo-400" />
                        )}
                      </div>

                      {member.wishlist.length > 0 ? (
                        <div className="text-emerald-500 bg-emerald-50 p-1.5 rounded-full" title="Lista lista">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className="text-slate-400 bg-slate-100 p-1.5 rounded-full" title="Sin lista">
                          <Clock className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <Button
                  variant="outline"
                  onClick={handleShare}
                  className="w-full text-xs"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 mr-2" />
                      ¡Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 mr-2" />
                      Copiar link de invitación
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
              <h4 className="font-medium text-sm text-indigo-700 mb-1">Consejo</h4>
              <p className="text-xs text-indigo-600/80">
                Comparte el link de invitación por WhatsApp o email para que se unan más amigos.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
