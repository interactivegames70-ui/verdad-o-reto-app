const PLAYER_NAMES_KEY = 'vor:savedPlayerNames' // clave legacy, compartida (antes de separar por modo)
const CUSTOM_CARDS_KEY = 'vor:savedCustomCards'

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // localStorage puede fallar (modo privado, cuota llena, etc.) — no es crítico, seguimos sin guardar.
  }
}

function playerNamesKey(group) {
  // 'pareja' y 'grupo' se guardan por separado. Sin group (todavía no elegido) se usa la clave legacy,
  // que no se vuelve a escribir salvo por la migración de abajo.
  return group ? `${PLAYER_NAMES_KEY}:${group}` : PLAYER_NAMES_KEY
}

export function loadSavedPlayerNames(group) {
  const key = playerNamesKey(group)
  const saved = readJson(key, null)
  if (saved !== null) return saved

  // Migración única: antes de este cambio, "pareja" y "grupo" compartían la misma lista guardada.
  // Esos datos viejos se conservan para "grupo" (el uso más común de la lista compartida),
  // y "pareja" arranca limpio para no heredar jugadores de más.
  if (group === 'grupo') {
    const legacy = readJson(PLAYER_NAMES_KEY, [])
    if (legacy.length > 0) {
      writeJson(key, legacy)
      return legacy
    }
  }
  return []
}

export function saveSavedPlayerNames(names, group) {
  writeJson(playerNamesKey(group), names)
}

export function makePlayersFromNames(names) {
  return names.map((name) => ({ id: Date.now() + Math.random(), name, score: 0 }))
}

export function loadSavedCustomCards() {
  return readJson(CUSTOM_CARDS_KEY, [])
}

export function saveSavedCustomCards(cards) {
  writeJson(CUSTOM_CARDS_KEY, cards)
}
