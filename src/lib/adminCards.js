import { supabase } from './supabase'

export async function fetchAllAdminCards() {
  const { data, error } = await supabase.from('admin_cards').select('*').order('created_at', { ascending: false })
  return { data: data ?? [], error }
}

// Trae todas (no filtra por status, a diferencia de community_cards — estas ya están "aprobadas" por definición)
export async function fetchAdminCardsFor({ group, modality }) {
  let query = supabase.from('admin_cards').select('*')
  if (group) query = query.in('group_mode', ['ambas', group])
  if (modality) query = query.in('modality', ['ambas', modality])
  const { data, error } = await query
  return { data: data ?? [], error }
}

export async function addAdminCard({ type, level, modality, groupMode, text, timerSeconds }) {
  return supabase
    .from('admin_cards')
    .insert({
      type,
      level,
      modality,
      group_mode: groupMode,
      text,
      timer_seconds: timerSeconds ?? null,
    })
    .select()
    .single()
}

export async function updateAdminCard(id, patch) {
  return supabase.from('admin_cards').update(patch).eq('id', id).select().single()
}

export async function deleteAdminCard(id) {
  return supabase.from('admin_cards').delete().eq('id', id)
}

export async function bulkAddAdminCards(cards) {
  const rows = cards.map((c) => ({
    type: c.type,
    level: c.level,
    modality: c.modality,
    group_mode: c.groupMode,
    text: c.text,
    timer_seconds: c.timerSeconds ?? null,
  }))
  // Supabase/PostgREST no tiene un límite chico documentado, pero se manda en
  // lotes para evitar payloads gigantes de una sola vez.
  const chunkSize = 200
  let inserted = 0
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize)
    const { error } = await supabase.from('admin_cards').insert(chunk)
    if (error) return { inserted, error }
    inserted += chunk.length
  }
  return { inserted, error: null }
}

// Convierte una fila de la tabla al formato que pickCard() espera (mismo shape que las community cards).
export function mapAdminCard(c) {
  return {
    communityId: c.id,
    type: c.type,
    level: c.level,
    modality: c.modality,
    group: c.group_mode,
    text: c.text,
    timerSeconds: c.timer_seconds ?? undefined,
  }
}
