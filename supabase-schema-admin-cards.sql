-- ============================================================
-- Verdad o Reto — Contenido oficial administrado (panel admin oculto)
-- Ejecutar en el SQL Editor de tu proyecto Supabase.
--
-- Estas cartas se suman SIEMPRE al banco de contenido del juego
-- (a diferencia de las de comunidad, que solo aparecen si se activa
-- el modo "Contenido de la comunidad"). Pensadas para que agreguen/editen/
-- quiten preguntas y retos del banco oficial sin tocar código ni desplegar.
--
-- El único candado real es la contraseña del panel dentro de la app
-- (src/config.js). No depende de que la cuenta sea "admin" en Supabase,
-- así que cualquiera que entre con esa contraseña puede escribir aquí —
-- igual que ya pasa con las salas de Partida Online.
-- ============================================================

create table if not exists public.admin_cards (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('truth', 'dare')),
  level int not null check (level between 1 and 4),
  modality text not null default 'ambas' check (modality in ('presencial', 'distancia', 'ambas')),
  group_mode text not null default 'ambas' check (group_mode in ('pareja', 'grupo', 'ambas')),
  text text not null,
  timer_seconds int,
  created_at timestamptz not null default now()
);

alter table public.admin_cards enable row level security;

drop policy if exists "admin_cards: lectura publica" on public.admin_cards;
drop policy if exists "admin_cards: solo admin agrega" on public.admin_cards;
drop policy if exists "admin_cards: solo admin edita" on public.admin_cards;
drop policy if exists "admin_cards: solo admin borra" on public.admin_cards;
drop policy if exists "admin_cards: escritura publica" on public.admin_cards;
drop policy if exists "admin_cards: edicion publica" on public.admin_cards;
drop policy if exists "admin_cards: borrado publico" on public.admin_cards;

create policy "admin_cards: lectura publica" on public.admin_cards for select using (true);
create policy "admin_cards: escritura publica" on public.admin_cards for insert with check (true);
create policy "admin_cards: edicion publica" on public.admin_cards for update using (true);
create policy "admin_cards: borrado publico" on public.admin_cards for delete using (true);
