-- ============================================================
-- Verdad o Reto — Partida Online: elegir modalidad (presencial / a distancia)
-- Ejecutar en el SQL Editor de tu proyecto Supabase.
--
-- Hasta ahora la Partida Online siempre asumía "a distancia". Esto agrega
-- la columna para que el anfitrión pueda elegir la modalidad al crear la sala,
-- igual que en la Partida Rápida.
-- ============================================================

alter table public.rooms add column if not exists modality text not null default 'distancia'
  check (modality in ('presencial', 'distancia'));
