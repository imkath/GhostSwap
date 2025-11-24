"use client"

import { AppHeader } from "@/components/app-header"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  CheckCircle2,
  Clock,
  Calendar,
  Wallet,
  Users,
  AlertCircle,
  Gift,
  ArrowLeft,
  Shuffle,
  Ghost,
  Eye,
  EyeOff,
  Share2,
  Copy,
  Check,
  Loader2,
  Settings,
  Trash2,
  LogOut,
  History,
  Pencil,
  UserMinus,
  RotateCcw,
  AlertTriangle
} from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase"
import { drawNames, resetDraw } from "@/app/actions/draw"
import { updateGroup, deleteGroup, leaveGroup, getGroupActivities, removeMember } from "@/app/actions/group"
import confetti from "canvas-confetti"
import { WishlistEditor } from "@/components/wishlist-editor"
import { GroupPageSkeleton } from "@/components/skeletons"
import { GroupInfoCard } from "@/components/group-info-card"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

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
  currency: string
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
  const [showDrawConfirm, setShowDrawConfirm] = useState(false)

  // Group management dialogs
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showLeaveDialog, setShowLeaveDialog] = useState(false)
  const [showActivityDialog, setShowActivityDialog] = useState(false)
  const [activities, setActivities] = useState<Array<{
    id: string
    type: string
    message: string
    created_at: string
    profiles: { full_name: string | null; email: string; avatar_url: string | null }
  }>>([])
  const [isLoadingActivities, setIsLoadingActivities] = useState(false)

  // Edit form state
  const [editName, setEditName] = useState("")
  const [editBudget, setEditBudget] = useState("")
  const [editCurrency, setEditCurrency] = useState("CLP")
  const [editDate, setEditDate] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null)
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [isResetting, setIsResetting] = useState(false)

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
    setShowDrawConfirm(false)
    setIsDrawing(true)
    setError("")

    const result = await drawNames(group.id)

    if (!result.success) {
      setError(result.error || "Error al realizar el sorteo")
      toast.error("Error al realizar el sorteo")
    } else {
      toast.success("¡Sorteo realizado con éxito!")
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
    toast.success("Link copiado al portapapeles")
    setTimeout(() => setCopied(false), 2000)
  }

  const handleOpenEdit = () => {
    if (group) {
      setEditName(group.name)
      setEditBudget(group.budget?.toString() || "")
      setEditCurrency(group.currency || "CLP")
      setEditDate(group.exchange_date || "")
      setShowEditDialog(true)
    }
  }

  const handleSaveEdit = async () => {
    if (!group) return
    setIsSaving(true)

    const result = await updateGroup(group.id, {
      name: editName,
      budget: editBudget ? parseFloat(editBudget) : null,
      currency: editCurrency,
      exchange_date: editDate || null
    })

    if (result.success) {
      toast.success("Grupo actualizado")
      setShowEditDialog(false)
      await fetchGroupData()
    } else {
      toast.error(result.error || "Error al actualizar")
    }

    setIsSaving(false)
  }

  const handleDelete = async () => {
    if (!group) return
    setIsDeleting(true)

    const result = await deleteGroup(group.id)

    if (result.success) {
      toast.success("Grupo eliminado")
      router.push("/dashboard")
    } else {
      toast.error(result.error || "Error al eliminar")
      setIsDeleting(false)
    }
  }

  const handleLeave = async () => {
    if (!group) return
    setIsLeaving(true)

    const result = await leaveGroup(group.id)

    if (result.success) {
      toast.success("Has abandonado el grupo")
      router.push("/dashboard")
    } else {
      toast.error(result.error || "Error al abandonar")
      setIsLeaving(false)
    }
  }

  const handleShowActivity = async () => {
    setShowActivityDialog(true)
    setIsLoadingActivities(true)

    const result = await getGroupActivities(groupId)

    if (result.success) {
      setActivities(result.activities as typeof activities)
    } else {
      toast.error(result.error || "Error al cargar actividades")
    }

    setIsLoadingActivities(false)
  }

  const handleRemoveMember = async (memberId: string) => {
    setRemovingMemberId(memberId)

    const result = await removeMember(groupId, memberId)

    if (result.success) {
      toast.success("Miembro eliminado")
      await fetchGroupData()
    } else {
      toast.error(result.error || "Error al eliminar miembro")
    }

    setRemovingMemberId(null)
  }

  const handleRevealMatch = () => {
    setShowMatch(true)
    // Fire confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    })
  }

  const handleResetDraw = async () => {
    if (!group) return
    setIsResetting(true)

    const result = await resetDraw(group.id)

    if (result.success) {
      toast.success("Sorteo reiniciado")
      setShowResetDialog(false)
      setShowMatch(false)
      setMatch(null)
      await fetchGroupData()
    } else {
      toast.error(result.error || "Error al reiniciar el sorteo")
    }

    setIsResetting(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AppHeader />
        <main className="container mx-auto px-4 py-8 max-w-5xl">
          <GroupPageSkeleton />
        </main>
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

            <div className="flex flex-wrap gap-2">
              {/* Activity Button */}
              <Button
                variant="outline"
                size="icon"
                onClick={handleShowActivity}
                title="Ver actividad"
              >
                <History className="w-4 h-4" />
              </Button>

              {/* Settings/Edit Button - Admin only */}
              {isAdmin && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleOpenEdit}
                  title="Editar grupo"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              )}

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
                  onClick={() => setShowDrawConfirm(true)}
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
                        onClick={handleRevealMatch}
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Revelar Amigo Secreto
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
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
                                <span className="flex-1">
                                  {item.description}
                                  {item.url && (
                                    <a
                                      href={item.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="ml-2 text-indigo-600 hover:underline text-xs"
                                      title={item.url}
                                    >
                                      ({new URL(item.url).hostname.replace('www.', '')}...)
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

            {/* Reset Draw Button - Admin only when DRAWN */}
            {isAdmin && group.status === "DRAWN" && (
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowResetDialog(true)}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reiniciar Sorteo
                </Button>
              </div>
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
            {/* Group Info Card */}
            {(group.budget || group.exchange_date) && (
              <GroupInfoCard
                budget={group.budget}
                currency={group.currency}
                exchangeDate={group.exchange_date}
              />
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Participantes
                  <Badge variant="outline">{members.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {members.map((member, index) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between animate-in fade-in slide-in-from-left-2 duration-300"
                      style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
                    >
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

                      <div className="flex items-center gap-1">
                        {member.wishlist.length > 0 ? (
                          <div className="text-emerald-500 bg-emerald-50 p-1.5 rounded-full" title="Lista lista">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="text-slate-400 bg-slate-100 p-1.5 rounded-full" title="Sin lista">
                            <Clock className="w-3.5 h-3.5" />
                          </div>
                        )}

                        {/* Remove button - admin only, planning state, not self */}
                        {isAdmin && group.status === "PLANNING" && member.user_id !== currentUserId && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveMember(member.id)}
                            disabled={removingMemberId === member.id}
                            className="h-6 w-6 text-slate-400 hover:text-red-500 hover:bg-red-50"
                            title="Eliminar miembro"
                          >
                            {removingMemberId === member.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <UserMinus className="w-3 h-3" />
                            )}
                          </Button>
                        )}
                      </div>
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

                {/* Leave button for non-admin members */}
                {!isAdmin && group.status === "PLANNING" && (
                  <>
                    <Separator className="my-3" />
                    <Button
                      variant="ghost"
                      onClick={() => setShowLeaveDialog(true)}
                      className="w-full text-xs text-slate-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-3 h-3 mr-2" />
                      Abandonar grupo
                    </Button>
                  </>
                )}
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

      {/* Draw Confirmation Dialog */}
      <Dialog open={showDrawConfirm} onOpenChange={setShowDrawConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shuffle className="w-5 h-5 text-indigo-600" />
              Confirmar sorteo
            </DialogTitle>
            <DialogDescription className="pt-2" asChild>
              <div>
                Esta acción es <strong>irreversible</strong>. Una vez realizado el sorteo:
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>Cada participante recibirá su Amigo Secreto</li>
                  <li>No podrás agregar más participantes</li>
                  <li>No podrás volver a sortear</li>
                </ul>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowDrawConfirm(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDraw}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Shuffle className="w-4 h-4 mr-2" />
              Confirmar sorteo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Group Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-5 h-5 text-indigo-600" />
              Editar grupo
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nombre del grupo</label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Nombre del grupo"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Presupuesto y moneda</label>
              <div className="flex gap-2">
                <select
                  value={editCurrency}
                  onChange={(e) => setEditCurrency(e.target.value)}
                  className="h-11 px-3 rounded-md border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="CLP">CLP ($)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="MXN">MXN ($)</option>
                  <option value="ARS">ARS ($)</option>
                  <option value="COP">COP ($)</option>
                  <option value="PEN">PEN (S/)</option>
                  <option value="BRL">BRL (R$)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
                <Input
                  type="number"
                  value={editBudget}
                  onChange={(e) => setEditBudget(e.target.value)}
                  placeholder="Presupuesto"
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Fecha del evento</label>
              <Input
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              variant="destructive"
              onClick={() => {
                setShowEditDialog(false)
                setShowDeleteDialog(true)
              }}
              className="sm:mr-auto"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar grupo
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={isSaving || !editName.trim()}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Group Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              Eliminar grupo
            </DialogTitle>
            <DialogDescription className="pt-2">
              ¿Estás seguro de que quieres eliminar <strong>{group?.name}</strong>?
              <br /><br />
              Esta acción es <strong>permanente</strong> y eliminará:
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li>Todos los miembros del grupo</li>
                <li>El historial de actividades</li>
                <li>Los resultados del sorteo (si aplica)</li>
              </ul>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Leave Group Dialog */}
      <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LogOut className="w-5 h-5 text-amber-600" />
              Abandonar grupo
            </DialogTitle>
            <DialogDescription className="pt-2">
              ¿Estás seguro de que quieres abandonar <strong>{group?.name}</strong>?
              <br /><br />
              Perderás acceso al grupo y no podrás ver tu Amigo Secreto asignado.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowLeaveDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleLeave}
              disabled={isLeaving}
            >
              {isLeaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <LogOut className="w-4 h-4 mr-2" />}
              Abandonar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Draw Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Reiniciar Sorteo
            </DialogTitle>
            <DialogDescription className="pt-2">
              <strong>Advertencia:</strong> Esto borrará las asignaciones actuales y tendrás que sortear de nuevo.
              <br /><br />
              Todos los participantes perderán la información de a quién les tocó regalar.
              <br /><br />
              ¿Estás seguro de que deseas continuar?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowResetDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleResetDraw}
              disabled={isResetting}
            >
              {isResetting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RotateCcw className="w-4 h-4 mr-2" />}
              Reiniciar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Activity Dialog */}
      <Dialog open={showActivityDialog} onOpenChange={setShowActivityDialog}>
        <DialogContent className="max-w-md max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-600" />
              Actividad del grupo
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[50vh] -mx-6 px-6">
            {isLoadingActivities ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
              </div>
            ) : activities.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No hay actividades registradas</p>
            ) : (
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex gap-3 text-sm">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={activity.profiles?.avatar_url || undefined} />
                        <AvatarFallback className="text-xs">
                          {activity.profiles?.full_name?.charAt(0) || "?"}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-700">{activity.message}</p>
                      <p className="text-xs text-slate-400">
                        {new Date(activity.created_at).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
