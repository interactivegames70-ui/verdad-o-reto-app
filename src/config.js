// Mientras probamos la app, dejamos todo el contenido Premium (niveles 2-4 y
// "Cambiar carta") desbloqueado para todos, sin importar la cuenta.
//
// Cuando terminemos de programar y estemos listos para lanzar de verdad,
// cambiar esto a `false` — a partir de ahí, cada persona vuelve a depender
// de si su perfil tiene `is_premium = true` en Supabase.
export const TESTING_UNLOCK_PREMIUM = true
