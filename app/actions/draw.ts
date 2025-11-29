'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { generateDerangement, type ExclusionMap } from '@/lib/derangement'
import { groupIdSchema } from '@/lib/validations'
import { sendDrawNotifications } from '@/lib/email'

interface DrawResult {
  success: boolean
  error?: string
}

export async function drawNames(groupId: string): Promise<DrawResult> {
  // Validate input
  const groupIdResult = groupIdSchema.safeParse(groupId)
  if (!groupIdResult.success) {
    return { success: false, error: groupIdResult.error.errors[0].message }
  }

  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return { success: false, error: 'No autenticado' }
  }

  // Verify user is admin of this group
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .select('id, admin_id, status, name')
    .eq('id', groupId)
    .single()

  if (groupError || !group) {
    return { success: false, error: 'Grupo no encontrado' }
  }

  if (group.admin_id !== user.id) {
    return { success: false, error: 'Solo el administrador puede realizar el sorteo' }
  }

  if (group.status === 'DRAWN') {
    return { success: false, error: 'El sorteo ya fue realizado' }
  }

  // Get all members with their profile info for email notifications
  const { data: members, error: membersError } = await supabase
    .from('members')
    .select('user_id, profiles(full_name, email)')
    .eq('group_id', groupId)

  if (membersError || !members) {
    return { success: false, error: 'Error al obtener miembros' }
  }

  if (members.length < 3) {
    return { success: false, error: 'Se necesitan al menos 3 participantes para el sorteo' }
  }

  // Extract user IDs
  const participantIds = members.map(m => m.user_id)

  // Get exclusions (gifting restrictions)
  const { data: exclusionsData } = await supabase
    .from('exclusions')
    .select('giver_id, excluded_receiver_id')
    .eq('group_id', groupId)

  // Build exclusion map
  const exclusions: ExclusionMap = new Map()
  if (exclusionsData && exclusionsData.length > 0) {
    for (const exc of exclusionsData) {
      if (!exclusions.has(exc.giver_id)) {
        exclusions.set(exc.giver_id, new Set())
      }
      exclusions.get(exc.giver_id)!.add(exc.excluded_receiver_id)
    }
  }

  // Generate derangement with exclusions
  const receivers = generateDerangement(participantIds, exclusions)

  if (!receivers) {
    return {
      success: false,
      error: 'No se pudo generar un sorteo válido con las restricciones actuales. Por favor, revisa las exclusiones configuradas.'
    }
  }

  // Create matches
  const matches = participantIds.map((giverId, index) => ({
    group_id: groupId,
    giver_id: giverId,
    receiver_id: receivers[index]
  }))

  // Insert matches
  const { error: matchError } = await supabase
    .from('matches')
    .insert(matches)

  if (matchError) {
    console.error('Error inserting matches:', matchError)
    return { success: false, error: `Error al guardar los resultados: ${matchError.message}` }
  }

  // Update group status
  const { error: updateError } = await supabase
    .from('groups')
    .update({ status: 'DRAWN' })
    .eq('id', groupId)

  if (updateError) {
    return { success: false, error: 'Error al actualizar el estado del grupo' }
  }

  // Log activity
  await supabase
    .from('activities')
    .insert({
      group_id: groupId,
      user_id: user.id,
      type: 'DRAW',
      message: `El sorteo de "${group.name}" ha sido realizado. ¡Revisa quién te tocó!`
    })

  // Send email notifications to all participants (don't await, run in background)
  const participants = members
    .map((m) => {
      const profile = m.profiles as unknown as { full_name: string | null; email: string } | null
      if (!profile?.email) return null
      return {
        email: profile.email,
        name: profile.full_name || 'Participante',
      }
    })
    .filter((p): p is { email: string; name: string } => p !== null)

  // Fire and forget - don't block the response
  sendDrawNotifications(participants, group.name, groupId).catch((err) => {
    console.error('Error sending draw notifications:', err)
  })

  revalidatePath(`/groups/${groupId}`)

  return { success: true }
}

export async function resetDraw(groupId: string): Promise<DrawResult> {
  // Validate input
  const groupIdResult = groupIdSchema.safeParse(groupId)
  if (!groupIdResult.success) {
    return { success: false, error: groupIdResult.error.errors[0].message }
  }

  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return { success: false, error: 'No autenticado' }
  }

  // Get group name for activity log
  const { data: group } = await supabase
    .from('groups')
    .select('name')
    .eq('id', groupId)
    .single()

  // Use secure database function to reset draw
  // This bypasses RLS to ensure all matches are deleted
  const { error: resetError } = await supabase
    .rpc('reset_group_draw', { p_group_id: groupId })

  if (resetError) {
    console.error('Error resetting draw:', resetError)
    return { success: false, error: resetError.message }
  }

  // Log activity
  await supabase
    .from('activities')
    .insert({
      group_id: groupId,
      user_id: user.id,
      type: 'DRAW_RESET',
      message: `El sorteo de "${group?.name || 'grupo'}" ha sido reiniciado`
    })

  revalidatePath(`/groups/${groupId}`)

  return { success: true }
}
