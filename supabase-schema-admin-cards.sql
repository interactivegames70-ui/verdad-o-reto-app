-- ============================================================
-- Verdad o Reto — Contenido oficial administrado (panel admin oculto)
-- Ejecutar en el SQL Editor de tu proyecto Supabase, DESPUÉS de
-- supabase-schema-community.sql (usa la misma columna profiles.is_admin).
--
-- Estas cartas se suman SIEMPRE al banco de contenido del juego
-- (a diferencia de las de comunidad, que solo aparecen si se activa
-- el modo "Contenido de la comunidad"). Pensadas para que tú (u otro
-- admin) agreguen/editen/quiten preguntas y retos del banco oficial
-- sin tener que tocar código ni volver a desplegar la app.
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

-- Lectura pública: todos los jugadores necesitan poder traer estas cartas para jugar.
create policy "admin_cards: lectura publica" on public.admin_cards for select using (true);

-- Escritura: solo cuentas marcadas is_admin = true en profiles.
create policy "admin_cards: solo admin agrega" on public.admin_cards for insert with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
);
create policy "admin_cards: solo admin edita" on public.admin_cards for update using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
);
create policy "admin_cards: solo admin borra" on public.admin_cards for delete using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
);
