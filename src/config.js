// Mientras probamos la app, dejamos todo el contenido Premium (niveles 2-4 y
// "Cambiar carta") desbloqueado para todos, sin importar la cuenta.
//
// Cuando terminemos de programar y estemos listos para lanzar de verdad,
// cambiar esto a `false` — a partir de ahí, cada persona vuelve a depender
// de si su perfil tiene `is_premium = true` en Supabase.
export const TESTING_UNLOCK_PREMIUM = true

// Contraseña para el panel admin oculto (se activa tocando el dado 7 veces
// seguidas en la pantalla de inicio). Esta contraseña es la ÚNICA barrera de
// acceso — ya no depende de tener una cuenta marcada is_admin en Supabase
// (ver supabase-schema-admin-cards.sql, que también se simplificó acorde).
// Cambiala cuando quieras avisándome.
export const ADMIN_PANEL_PASSWORD = 'lcR2IlSojf3GpVxJ0O6ynTf8EorR'
