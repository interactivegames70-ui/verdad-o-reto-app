-- ============================================================
-- Verdad o Reto — Fase 5: Reportar contenido de la comunidad
-- Ejecutar en el SQL Editor de tu proyecto Supabase, DESPUÉS de
-- supabase-schema-community.sql y supabase-schema-profiles.sql
-- ============================================================

create table if not exists public.community_card_reports (
  card_id uuid not null references public.community_cards(id) on delete cascade,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reason text,
  created_at timestamptz not null default now(),
  primary key (card_id, reporter_id)
);

create index if not exists community_card_reports_card_idx on public.community_card_reports(card_id);

alter table public.community_card_reports enable row level security;

-- Cualquier usuario autenticado (incluido invitado) puede reportar una carta,
-- solo a nombre propio.
drop policy if exists "reports: crear" on public.community_card_reports;
create policy "reports: crear" on public.community_card_reports
  for insert with check (reporter_id = auth.uid());

-- Solo los administradores pueden ver y gestionar los reportes.
drop policy if exists "reports: leer (admin)" on public.community_card_reports;
create policy "reports: leer (admin)" on public.community_card_reports
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

drop policy if exists "reports: borrar (admin)" on public.community_card_reports;
create policy "reports: borrar (admin)" on public.community_card_reports
  for delete using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );
