const STORAGE_KEY = 'vor_client_id'

function randomId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// Cada dispositivo/navegador tiene un id propio que persiste entre partidas,
// así si alguien recarga la página durante una partida online puede reconectarse
// a la misma sala sin perder su lugar.
export function getClientId() {
  let id = localStorage.getItem(STORAGE_KEY)
  if (!id) {
    id = randomId()
    localStorage.setItem(STORAGE_KEY, id)
  }
  return id
}
