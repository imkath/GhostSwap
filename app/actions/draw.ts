'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { generateDerangement } from '@/lib/derangement'
import { groupIdSchema } from '@/lib/validations'

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

  // Get all members
  const { data: members, error: membersError } = await supabase
    .from('members')
    .select('user_id')
    .eq('group_id', groupId)

  if (membersError || !members) {
    return { success: false, error: 'Error al obtener miembros' }
  }

  if (members.length < 3) {
    return { success: false, error: 'Se necesitan al menos 3 participantes para el sorteo' }
  }

  // Extract user IDs
  const participantIds = members.map(m => m.user_id)

  // Generate derangement
  const receivers = generateDerangement(participantIds)

  if (!receivers) {
    return { success: false, error: 'Error al generar el sorteo' }
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
