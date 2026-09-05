-- ============================================================
-- Verdad o Reto — Fase 2: Cuentas y perfiles
-- Ejecutar en el SQL Editor de tu proyecto Supabase, DESPUÉS
-- de habilitar los proveedores de autenticación:
--   Authentication → Providers → Google (activar, con tu
--   Client ID / Secret de Google Cloud y la Authorized redirect
--   URI que te muestra Supabase)
--   Authentication → Providers → Anonymous Sign-ins (activar,
--   para el modo "Jugar como invitado")
-- ============================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null default 'Jugador',
  avatar_emoji text not null default '🦊',
  avatar_color text not null default '#ff2d78',
  is_anonymous boolean not null default false,
  games_played int not null default 0,
  truths_answered int not null default 0,
  dares_completed int not null default 0,
  dares_failed int not null default 0,
  points_total int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: lectura pública" on public.profiles for select using (true);
create policy "profiles: cada quien actualiza su propio perfil" on public.profiles for update using (auth.uid() = id);
create policy "profiles: cada quien crea su propio perfil" on public.profiles for insert with check (auth.uid() = id);

-- Crea automáticamente la fila de perfil apenas alguien se registra
-- (con Google o como invitado anónimo)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, is_anonymous)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'Jugador'),
    coalesce(new.is_anonymous, false)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Mantiene updated_at al día en cada cambio de perfil
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();
