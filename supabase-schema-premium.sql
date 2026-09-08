-- ============================================================
-- Verdad o Reto — Monetización: bandera Premium
-- Ejecutar en el SQL Editor de tu proyecto Supabase.
--
-- Por ahora esta bandera se activa MANUALMENTE mientras se define
-- el método de pago (Stripe / RevenueCat / etc). Para probar el
-- modo Premium en tu propia cuenta, corré esto una vez que tengas
-- tu UUID (Authentication → Users → copiar el UUID de tu usuario):
--
--   update public.profiles set is_premium = true where id = 'TU-UUID-DE-USUARIO';
--
-- Cuando se conecte el cobro real, esta misma columna es la que
-- hay que actualizar automáticamente tras un pago exitoso.
-- ============================================================

alter table public.profiles add column if not exists is_premium boolean not null default false;
