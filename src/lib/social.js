import { supabase } from './supabase'

export async function fetchPublicProfile(userId) {
  if (!userId) return { data: null, error: null }
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, avatar_emoji, avatar_color, is_anonymous')
    .eq('id', userId)
    .maybeSingle()
  return { data, error }
}

// Solo lo aprobado es "público": lo pendiente/rechazado es privado del autor.
export async function fetchPublicCardsFor(userId) {
  if (!userId) return { data: [], error: null }
  const { data, error } = await supabase
    .from('community_cards')
    .select('id, type, level, text, likes_count, uses_count, created_at')
    .eq('author_id', userId)
    .eq('status', 'approved')
    .order('likes_count', { ascending: false })
  return { data: data ?? [], error }
}

// Los invitados no tienen perfil "real", así que no aparecen en el buscador.
export async function searchProfiles(query) {
  const q = query?.trim()
  if (!q) return { data: [], error: null }
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, avatar_emoji, avatar_color')
    .eq('is_anonymous', false)
    .ilike('username', `%${q}%`)
    .limit(20)
  return { data: data ?? [], error }
}

export async function fetchFollowCounts(userId) {
  if (!userId) return { followers: 0, following: 0 }
  const [{ count: followers }, { count: following }] = await Promise.all([
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('followed_id', userId),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId),
  ])
  return { followers: followers ?? 0, following: following ?? 0 }
}

export async function isFollowing(followerId, followedId) {
  if (!followerId || !followedId) return false
  const { data } = await supabase
    .from('follows')
    .select('follower_id')
    .eq('follower_id', followerId)
    .eq('followed_id', followedId)
    .maybeSingle()
  return !!data
}

export async function followUser(followerId, followedId) {
  const { error } = await supabase.from('follows').insert({ follower_id: followerId, followed_id: followedId })
  return { error }
}

export async function unfollowUser(followerId, followedId) {
  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', followerId)
    .eq('followed_id', followedId)
  return { error }
}
