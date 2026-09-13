const PLAYER_NAMES_KEY = 'vor:savedPlayerNames'
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

export function loadSavedPlayerNames() {
  return readJson(PLAYER_NAMES_KEY, [])
}

export function saveSavedPlayerNames(names) {
  writeJson(PLAYER_NAMES_KEY, names)
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
