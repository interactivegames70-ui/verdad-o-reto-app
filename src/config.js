// Mientras probamos la app, dejamos todo el contenido Premium (niveles 2-4 y
// "Cambiar carta") desbloqueado para todos, sin importar la cuenta.
//
// Cuando terminemos de programar y estemos listos para lanzar de verdad,
// cambiar esto a `false` — a partir de ahí, cada persona vuelve a depender
// de si su perfil tiene `is_premium = true` en Supabase.
export const TESTING_UNLOCK_PREMIUM = true

// Contraseña para el panel admin oculto (se activa tocando el dado 7 veces
// seguidas en la pantalla de inicio). Solo sirve para REVELAR el acceso en
// la app — la escritura real en la base de datos sigue protegida aparte por
// Supabase (is_admin=true en el perfil), así que cambiar esta contraseña no
// le da permisos a nadie por sí sola. Cambiala cuando quieras avisándome.
export const ADMIN_PANEL_PASSWORD = 'vor-admin-2026'
