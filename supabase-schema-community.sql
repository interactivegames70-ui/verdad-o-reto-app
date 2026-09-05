-- ============================================================
-- Verdad o Reto — Fase 2: Contenido creado por la comunidad
-- Ejecutar en el SQL Editor de tu proyecto Supabase, DESPUÉS
-- de haber corrido supabase-schema-profiles.sql (usa la tabla
-- public.profiles como referencia de autor y para moderación).
-- ============================================================

-- Columna para marcar moderadores. Por ahora no hay panel de admin
-- en Supabase Auth propiamente, así que para probar la moderación
-- marcá tu propio perfil como admin corriendo, una vez que tengas
-- tu usuario creado:
--   update public.profiles set is_admin = true where id = 'TU-UUID-DE-USUARIO';
alter table public.profiles add column if not exists is_admin boolean not null default false;

create table if not exists public.community_cards (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles(id) on delete set null,
  type text not null check (type in ('truth', 'dare')),
  level int not null check (level between 1 and 4),
  group_mode text not null default 'ambas' check (group_mode in ('pareja', 'grupo', 'ambas')),
  modality text not null default 'ambas' check (modality in ('presencial', 'distancia', 'ambas')),
  text text not null,
  timer_seconds int,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  likes_count int not null default 0,
  uses_count int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists community_cards_status_idx on public.community_cards(status);
create index if not exists community_cards_author_idx on public.community_cards(author_id);

create table if not exists public.community_card_likes (
  card_id uuid not null references public.community_cards(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (card_id, user_id)
);

alter table public.community_cards enable row level security;
alter table public.community_card_likes enable row level security;

-- Lectura: aprobadas para todos, + las propias (aunque estén pendientes/rechazadas), + todas si sos admin
create policy "community_cards: lectura" on public.community_cards for select using (
  status = 'approved'
  or author_id = auth.uid()
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
);

-- Cualquiera con sesión puede publicar (queda 'pending' hasta que un admin la apruebe)
create policy "community_cards: publicar" on public.community_cards for insert with check (author_id = auth.uid());

-- Solo un admin puede aprobar/rechazar directamente (likes y usos se actualizan vía función, no acá)
create policy "community_cards: moderar" on public.community_cards for update using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
);

create policy "community_cards: borrar propia o admin" on public.community_cards for delete using (
  author_id = auth.uid() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
);

create policy "community_card_likes: ver mis likes" on public.community_card_likes for select using (user_id = auth.uid());

-- ------------------------------------------------------------
-- Funciones (security definer): evitan tener que dar permiso de
-- UPDATE amplio sobre community_cards solo para sumar un like o un uso.
-- ------------------------------------------------------------

create or replace function public.toggle_card_like(p_card_id uuid)
returns boolean
language plpgsql
security definer set search_path = public
as $$
declare
  already_liked boolean;
begin
  select exists(
    select 1 from public.community_card_likes where card_id = p_card_id and user_id = auth.uid()
  ) into already_liked;

  if already_liked then
    delete from public.community_card_likes where card_id = p_card_id and user_id = auth.uid();
    update public.community_cards set likes_count = greatest(0, likes_count - 1) where id = p_card_id;
    return false;
  else
    insert into public.community_card_likes (card_id, user_id) values (p_card_id, auth.uid());
    update public.community_cards set likes_count = likes_count + 1 where id = p_card_id;
    return true;
  end if;
end;
$$;

create or replace function public.increment_card_uses(p_card_id uuid)
returns void
language sql
security definer set search_path = public
as $$
  update public.community_cards set uses_count = uses_count + 1 where id = p_card_id;
$$;
