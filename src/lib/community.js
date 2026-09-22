import { supabase } from './supabase'

export async function fetchApprovedCards({ group, modality }) {
  let query = supabase
    .from('community_cards')
    .select('*, profiles(username, avatar_emoji, avatar_color, is_anonymous)')
    .eq('status', 'approved')
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

export async function hasLikedCard(cardId, userId) {
  if (!cardId || !userId) return false
  const { data } = await supabase
    .from('community_card_likes')
    .select('card_id')
    .eq('card_id', cardId)
    .eq('user_id', userId)
    .maybeSingle()
  return !!data
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

export async function reportCard(cardId, reporterId, reason) {
  const { error } = await supabase
    .from('community_card_reports')
    .insert({ card_id: cardId, reporter_id: reporterId, reason: reason || null })
  // Un mismo usuario solo puede reportar una vez la misma carta (clave primaria
  // card_id + reporter_id): si ya la había reportado, no lo tratamos como error.
  if (error && error.code === '23505') return { error: null, alreadyReported: true }
  return { error }
}

// Trae las cartas aprobadas que tienen al menos un reporte, agrupadas con su
// cantidad de reportes, para el panel de moderación.
export async function fetchReportedCards() {
  const { data, error } = await supabase
    .from('community_card_reports')
    .select('card_id, reason, created_at, community_cards(*, profiles(username, avatar_emoji, is_anonymous))')
    .order('created_at', { ascending: false })
  if (error) return { data: [], error }

  const byCard = new Map()
  for (const row of data ?? []) {
    const card = row.community_cards
    if (!card) continue
    if (!byCard.has(card.id)) {
      byCard.set(card.id, { ...card, reportCount: 0, reasons: [] })
    }
    const entry = byCard.get(card.id)
    entry.reportCount += 1
    if (row.reason) entry.reasons.push(row.reason)
  }
  return { data: Array.from(byCard.values()), error: null }
}

export async function dismissReports(cardId) {
  return supabase.from('community_card_reports').delete().eq('card_id', cardId)
}
