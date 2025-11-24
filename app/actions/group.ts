"use server"

import { createClient } from "@/lib/supabase-server"

export async function updateGroup(
  groupId: string,
  data: {
    name?: string
    budget?: number | null
    currency?: string
    exchange_date?: string | null
  }
) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "No autenticado" }
  }

  // Verify user is admin
  const { data: group } = await supabase
    .from('groups')
    .select('admin_id')
    .eq('id', groupId)
    .single()

  if (!group || group.admin_id !== user.id) {
    return { success: false, error: "No tienes permisos para editar este grupo" }
  }

  const { error } = await supabase
    .from('groups')
    .update(data)
    .eq('id', groupId)

  if (error) {
    return { success: false, error: error.message }
  }

  // Log activity
  await supabase
    .from('activities')
    .insert({
      group_id: groupId,
      user_id: user.id,
      type: 'GROUP_UPDATED',
      message: `Grupo actualizado`
    })

  return { success: true }
}

export async function deleteGroup(groupId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "No autenticado" }
  }

  // Verify user is admin
  const { data: group } = await supabase
    .from('groups')
    .select('admin_id, name')
    .eq('id', groupId)
    .single()

  if (!group || group.admin_id !== user.id) {
    return { success: false, error: "No tienes permisos para eliminar este grupo" }
  }

  // Delete in order: activities, matches, members, group
  await supabase.from('activities').delete().eq('group_id', groupId)
  await supabase.from('matches').delete().eq('group_id', groupId)
  await supabase.from('members').delete().eq('group_id', groupId)

  const { error } = await supabase
    .from('groups')
    .delete()
    .eq('id', groupId)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function leaveGroup(groupId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "No autenticado" }
  }

  // Check if user is admin
  const { data: group } = await supabase
    .from('groups')
    .select('admin_id, status')
    .eq('id', groupId)
    .single()

  if (!group) {
    return { success: false, error: "Grupo no encontrado" }
  }

  if (group.admin_id === user.id) {
    return { success: false, error: "El administrador no puede abandonar el grupo. Debes eliminarlo o transferir la administración." }
  }

  if (group.status === 'DRAWN') {
    return { success: false, error: "No puedes abandonar un grupo después del sorteo" }
  }

  // Get user's profile for activity log
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', user.id)
    .single()

  // Delete member
  const { error } = await supabase
    .from('members')
    .delete()
    .eq('group_id', groupId)
    .eq('user_id', user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  // Log activity
  await supabase
    .from('activities')
    .insert({
      group_id: groupId,
      user_id: user.id,
      type: 'MEMBER_LEFT',
      message: `${profile?.full_name || profile?.email || 'Un miembro'} abandonó el grupo`
    })

  return { success: true }
}

export async function removeMember(groupId: string, memberId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "No autenticado" }
  }

  // Verify user is admin
  const { data: group } = await supabase
    .from('groups')
    .select('admin_id, status')
    .eq('id', groupId)
    .single()

  if (!group || group.admin_id !== user.id) {
    return { success: false, error: "No tienes permisos para eliminar miembros" }
  }

  if (group.status === 'DRAWN') {
    return { success: false, error: "No puedes eliminar miembros después del sorteo" }
  }

  // Get member info for activity log
  const { data: member } = await supabase
    .from('members')
    .select(`
      user_id,
      profiles:user_id (
        full_name,
        email
      )
    `)
    .eq('id', memberId)
    .eq('group_id', groupId)
    .single()

  if (!member) {
    return { success: false, error: "Miembro no encontrado" }
  }

  // Can't remove yourself (admin)
  if (member.user_id === user.id) {
    return { success: false, error: "No puedes eliminarte a ti mismo" }
  }

  // Delete member
  const { error } = await supabase
    .from('members')
    .delete()
    .eq('id', memberId)

  if (error) {
    return { success: false, error: error.message }
  }

  // Log activity
  const memberProfile = member.profiles as { full_name: string | null; email: string } | null
  await supabase
    .from('activities')
    .insert({
      group_id: groupId,
      user_id: user.id,
      type: 'MEMBER_REMOVED',
      message: `${memberProfile?.full_name || memberProfile?.email || 'Un miembro'} fue eliminado del grupo`
    })

  return { success: true }
}

export async function getGroupActivities(groupId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "No autenticado", activities: [] }
  }

  // Verify user is member
  const { data: member } = await supabase
    .from('members')
    .select('id')
    .eq('group_id', groupId)
    .eq('user_id', user.id)
    .single()

  if (!member) {
    return { success: false, error: "No eres miembro de este grupo", activities: [] }
  }

  const { data: activities, error } = await supabase
    .from('activities')
    .select(`
      id,
      type,
      message,
      created_at,
      profiles:user_id (
        full_name,
        email,
        avatar_url
      )
    `)
    .eq('group_id', groupId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    return { success: false, error: error.message, activities: [] }
  }

  return { success: true, activities: activities || [] }
}
