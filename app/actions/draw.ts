'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

interface DrawResult {
  success: boolean
  error?: string
}

/**
 * The Ghost Algorithm - Generates a perfect derangement
 * A derangement is a permutation where no element appears in its original position
 * (i.e., no one is assigned to themselves)
 */
function generateDerangement(participants: string[]): string[] | null {
  const n = participants.length
  if (n < 2) return null

  // Fisher-Yates shuffle with derangement check
  const shuffled = [...participants]

  for (let attempts = 0; attempts < 100; attempts++) {
    // Shuffle
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }

    // Check if it's a valid derangement
    let isDerangement = true
    for (let i = 0; i < n; i++) {
      if (shuffled[i] === participants[i]) {
        isDerangement = false
        break
      }
    }

    if (isDerangement) {
      return shuffled
    }
  }

  // Fallback: Use Sattolo's algorithm for guaranteed derangement
  const result = [...participants]
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i) // Note: excludes i
    ;[result[i], result[j]] = [result[j], result[i]]
  }

  return result
}

export async function drawNames(groupId: string): Promise<DrawResult> {
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
    return { success: false, error: 'Error al guardar los resultados del sorteo' }
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
