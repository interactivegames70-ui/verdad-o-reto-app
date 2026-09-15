-- ============================================================
-- Verdad o Reto — Fase 4: Perfiles públicos, likes solo para
-- contenido de usuarios reales, y sistema de seguidores
-- Ejecutar en el SQL Editor de tu proyecto Supabase, DESPUÉS de
-- supabase-schema-profiles.sql y supabase-schema-community.sql
-- ============================================================

-- Los invitados (is_anonymous = true) pueden seguir subiendo preguntas y
-- retos, pero esas cartas no se pueden likear (no tienen un perfil "real"
-- al que asociar el like). Se reemplaza la función para chequear el autor.
create or replace function public.toggle_card_like(p_card_id uuid)
returns boolean
language plpgsql
security definer set search_path = public
as $$
declare
  already_liked boolean;
  author_is_anon boolean;
begin
  select p.is_anonymous into author_is_anon
  from public.community_cards c
  join public.profiles p on p.id = c.author_id
  where c.id = p_card_id;

  if author_is_anon is distinct from false then
    raise exception 'No se puede dar like a contenido subido por un invitado';
  end if;

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

-- ------------------------------------------------------------
-- Seguidores
-- ------------------------------------------------------------
create table if not exists public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  followed_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, followed_id),
  check (follower_id <> followed_id)
);

create index if not exists follows_followed_idx on public.follows(followed_id);
create index if not exists follows_follower_idx on public.follows(follower_id);

alter table public.follows enable row level security;

-- Lectura pública: para poder mostrar contadores de seguidores/seguidos de cualquiera
drop policy if exists "follows: lectura pública" on public.follows;
create policy "follows: lectura pública" on public.follows for select using (true);

drop policy if exists "follows: seguir" on public.follows;
create policy "follows: seguir" on public.follows for insert with check (follower_id = auth.uid());

drop policy if exists "follows: dejar de seguir" on public.follows;
create policy "follows: dejar de seguir" on public.follows for delete using (follower_id = auth.uid());

-- No se puede seguir a un invitado (no tiene perfil "real" ni sentido seguirlo)
create or replace function public.check_follow_not_anonymous()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  target_is_anon boolean;
begin
  select is_anonymous into target_is_anon from public.profiles where id = new.followed_id;
  if target_is_anon is distinct from false then
    raise exception 'No se puede seguir a un invitado';
  end if;
  return new;
end;
$$;

drop trigger if exists follows_check_not_anonymous on public.follows;
create trigger follows_check_not_anonymous
  before insert on public.follows
  for each row execute function public.check_follow_not_anonymous();
