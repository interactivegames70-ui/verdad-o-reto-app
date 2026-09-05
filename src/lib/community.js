import { supabase } from './supabase'

export async function fetchApprovedCards({ group, modality }) {
  let query = supabase.from('community_cards').select('*').eq('status', 'approved')
  if (group) query = query.in('group_mode', ['ambas', group])
  if (modality) query = query.in('modality', ['ambas', modality])
  const { data, error } = await query.order('likes_count', { ascending: false })
  return { data: data ?? [], error }
}

export async function fetchMyCards(userId) {
  const { data, error } = await supabase
    .from('community_cards')
    .select('*')
    .eq('author_id', userId)
    .order('created_at', { ascending: false })
  return { data: data ?? [], error }
}

export async function fetchPendingCards() {
  const { data, error } = await supabase
    .from('community_cards')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
  return { data: data ?? [], error }
}

export async function fetchMyLikedCardIds(userId) {
  const { data } = await supabase.from('community_card_likes').select('card_id').eq('user_id', userId)
  return new Set((data ?? []).map((r) => r.card_id))
}

export async function submitCard({ authorId, type, level, groupMode, modality, text, timerSeconds }) {
  return supabase
    .from('community_cards')
    .insert({
      author_id: authorId,
      type,
      level,
      group_mode: groupMode,
      modality,
      text,
      timer_seconds: type === 'dare' ? timerSeconds : null,
    })
    .select()
    .single()
}

export async function toggleCardLike(cardId) {
  const { data, error } = await supabase.rpc('toggle_card_like', { p_card_id: cardId })
  return { liked: data, error }
}

export async function incrementCardUses(cardId) {
  await supabase.rpc('increment_card_uses', { p_card_id: cardId })
}

export async function moderateCard(cardId, status) {
  return supabase.from('community_cards').update({ status }).eq('id', cardId).select().single()
}
