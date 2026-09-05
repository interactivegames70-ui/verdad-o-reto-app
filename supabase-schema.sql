-- ============================================================
-- Verdad o Reto — Fase 2: Partida Online
-- Ejecutar en el SQL Editor de tu proyecto Supabase
-- ============================================================

create extension if not exists "pgcrypto";

-- Una fila por sala/partida online
create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  host_client_id text not null,
  group_mode text not null check (group_mode in ('pareja', 'grupo')),
  status text not null default 'lobby' check (status in ('lobby', 'playing', 'finished')),
  state jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- nota: la columna se llama group_mode (no "group") porque GROUP es palabra reservada en SQL.

-- Jugadores dentro de cada sala
create table if not exists public.room_players (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  client_id text not null,
  name text not null,
  score int not null default 0,
  is_host boolean not null default false,
  joined_at timestamptz not null default now(),
  unique (room_id, client_id)
);

create index if not exists room_players_room_id_idx on public.room_players(room_id);
create index if not exists rooms_code_idx on public.rooms(code);

-- Habilitar Realtime para que los cambios se transmitan a todos los dispositivos
alter publication supabase_realtime add table public.rooms;
alter publication supabase_realtime add table public.room_players;

-- ------------------------------------------------------------
-- RLS: juego sin cuentas de usuario (anónimo), así que se
-- habilitan políticas públicas de lectura/escritura. Cualquiera
-- con el código de sala puede leer/escribir esa sala — aceptable
-- para un juego casual sin datos sensibles.
-- ------------------------------------------------------------
alter table public.rooms enable row level security;
alter table public.room_players enable row level security;

create policy "rooms: lectura pública" on public.rooms for select using (true);
create policy "rooms: creación pública" on public.rooms for insert with check (true);
create policy "rooms: actualización pública" on public.rooms for update using (true);
create policy "rooms: borrado público" on public.rooms for delete using (true);

create policy "room_players: lectura pública" on public.room_players for select using (true);
create policy "room_players: alta pública" on public.room_players for insert with check (true);
create policy "room_players: actualización pública" on public.room_players for update using (true);
create policy "room_players: baja pública" on public.room_players for delete using (true);
