'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Ban, Trash2, UserX, AlertCircle, Info } from 'lucide-react'
import {
  addExclusion,
  removeExclusion,
  getExclusions,
  getExclusionLimits,
} from '@/app/actions/exclusions'
import { toast } from 'sonner'
import { Progress } from '@/components/ui/progress'

interface Member {
  id: string
  user_id: string
  profile: {
    full_name: string | null
    email: string
    avatar_url: string | null
  }
}

interface Exclusion {
  id: string
  group_id: string
  giver_id: string
  excluded_receiver_id: string
  created_at: string
}

interface ExclusionsManagerProps {
  groupId: string
  members: Member[]
  isAdmin: boolean
  isDrawn: boolean
}

interface ExclusionLimits {
  current: number
  max: number
  remaining: number
  maxPerPerson: number
}

export function ExclusionsManager({ groupId, members, isAdmin, isDrawn }: ExclusionsManagerProps) {
  const [showDialog, setShowDialog] = useState(false)
  const [exclusions, setExclusions] = useState<Exclusion[]>([])
  const [selectedGiver, setSelectedGiver] = useState('')
  const [selectedExcluded, setSelectedExcluded] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [limits, setLimits] = useState<ExclusionLimits | null>(null)

  useEffect(() => {
    if (showDialog) {
      loadExclusions()
    }
  }, [showDialog])

  const loadExclusions = async () => {
    setIsLoading(true)
    const [exclusionsResult, limitsResult] = await Promise.all([
      getExclusions(groupId),
      getExclusionLimits(groupId),
    ])

    if (exclusionsResult.success && exclusionsResult.exclusions) {
      setExclusions(exclusionsResult.exclusions)
    } else {
      toast.error(exclusionsResult.error || 'Error al cargar restricciones')
    }

    if (limitsResult.success && limitsResult.limits) {
      setLimits(limitsResult.limits)
    }
    setIsLoading(false)
  }

  const handleAddExclusion = async () => {
    if (!selectedGiver || !selectedExcluded) {
      toast.error('Debes seleccionar ambas personas')
      return
    }

    if (selectedGiver === selectedExcluded) {
      toast.error('No puedes excluir a una persona de sí misma')
      return
    }

    setIsAdding(true)
    const result = await addExclusion(groupId, selectedGiver, selectedExcluded)

    if (result.success) {
      toast.success('Restricción agregada')
      setSelectedGiver('')
      setSelectedExcluded('')
      await loadExclusions()
    } else {
      toast.error(result.error || 'Error al agregar restricción')
    }
    setIsAdding(false)
  }

  const handleRemoveExclusion = async (exclusionId: string) => {
    const result = await removeExclusion(exclusionId)

    if (result.success) {
      toast.success('Restricción eliminada')
      await loadExclusions()
    } else {
      toast.error(result.error || 'Error al eliminar restricción')
    }
  }

  const getMemberById = (userId: string) => {
    return members.find((m) => m.user_id === userId)
  }

  const getInitial = (profile: { full_name: string | null; email: string }) => {
    return (profile.full_name || profile.email || '?')[0]?.toUpperCase() || '?'
  }

  const getAvailableReceivers = () => {
    if (!selectedGiver) return members

    // Filter out the giver themselves and already excluded members
    const alreadyExcluded = exclusions
      .filter((e) => e.giver_id === selectedGiver)
      .map((e) => e.excluded_receiver_id)

    return members.filter(
      (m) => m.user_id !== selectedGiver && !alreadyExcluded.includes(m.user_id)
    )
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setShowDialog(true)}
        disabled={!isAdmin || isDrawn}
        className="gap-2"
      >
        <Ban className="h-4 w-4" />
        Restricciones
        {exclusions.length > 0 && (
          <Badge variant="secondary" className="ml-1">
            {exclusions.length}
          </Badge>
        )}
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Restricciones de Regalos</DialogTitle>
            <DialogDescription>
              Define quién no puede regalarle a quién. Por ejemplo, parejas que no quieren
              intercambiar regalos entre sí.
            </DialogDescription>
          </DialogHeader>

          {isDrawn && (
            <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-900">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p className="text-sm">
                No se pueden modificar las restricciones después de realizar el sorteo.
              </p>
            </div>
          )}

          {!isDrawn && isAdmin && limits && (
            <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
              <Info className="h-5 w-5 shrink-0 text-blue-600" />
              <div className="flex-1">
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-blue-900">
                    {limits.remaining > 0
                      ? `Puedes agregar ${limits.remaining} restricción${limits.remaining !== 1 ? 'es' : ''} más`
                      : 'Límite de restricciones alcanzado'}
                  </span>
                  <span className="font-medium text-blue-700">
                    {limits.current}/{limits.max}
                  </span>
                </div>
                <Progress value={(limits.current / limits.max) * 100} className="h-2" />
                <p className="mt-1 text-xs text-blue-600">
                  Máx. {limits.maxPerPerson} por persona · {members.length} participantes
                </p>
              </div>
            </div>
          )}

          {!isDrawn && isAdmin && (
            <div className="bg-muted/30 space-y-4 rounded-lg border p-4">
              <h3 className="text-sm font-semibold">Agregar Nueva Restricción</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Persona que regala</label>
                  <Select value={selectedGiver} onValueChange={setSelectedGiver}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {members.map((member) => (
                        <SelectItem key={member.user_id} value={member.user_id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={member.profile.avatar_url || undefined} />
                              <AvatarFallback className="text-xs">
                                {getInitial(member.profile)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">
                              {member.profile.full_name || member.profile.email}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">No puede regalarle a</label>
                  <Select
                    value={selectedExcluded}
                    onValueChange={setSelectedExcluded}
                    disabled={!selectedGiver}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableReceivers().map((member) => (
                        <SelectItem key={member.user_id} value={member.user_id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={member.profile.avatar_url || undefined} />
                              <AvatarFallback className="text-xs">
                                {getInitial(member.profile)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">
                              {member.profile.full_name || member.profile.email}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={handleAddExclusion}
                disabled={
                  !selectedGiver || !selectedExcluded || isAdding || limits?.remaining === 0
                }
                className="w-full"
              >
                {isAdding
                  ? 'Agregando...'
                  : limits?.remaining === 0
                    ? 'Límite alcanzado'
                    : 'Agregar Restricción'}
              </Button>
            </div>
          )}

          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Restricciones Actuales ({exclusions.length})</h3>

            {isLoading ? (
              <div className="text-muted-foreground py-8 text-center">
                Cargando restricciones...
              </div>
            ) : exclusions.length === 0 ? (
              <div className="text-muted-foreground py-8 text-center">
                <UserX className="mx-auto mb-2 h-12 w-12 opacity-50" />
                <p>No hay restricciones configuradas</p>
                <p className="text-sm">Todos pueden regalarle a todos</p>
              </div>
            ) : (
              <div className="space-y-2">
                {exclusions.map((exclusion) => {
                  const giver = getMemberById(exclusion.giver_id)
                  const excluded = getMemberById(exclusion.excluded_receiver_id)

                  if (!giver || !excluded) return null

                  return (
                    <div
                      key={exclusion.id}
                      className="bg-card flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={giver.profile.avatar_url || undefined} />
                            <AvatarFallback className="text-xs">
                              {getInitial(giver.profile)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">
                            {giver.profile.full_name || giver.profile.email}
                          </span>
                        </div>

                        <Ban className="text-muted-foreground h-4 w-4" />

                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={excluded.profile.avatar_url || undefined} />
                            <AvatarFallback className="text-xs">
                              {getInitial(excluded.profile)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">
                            {excluded.profile.full_name || excluded.profile.email}
                          </span>
                        </div>
                      </div>

                      {isAdmin && !isDrawn && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveExclusion(exclusion.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
