import { isEffectsEnabled } from './sound'

export function vibrate(pattern) {
  if (!isEffectsEnabled()) return
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate(pattern)
    } catch {
      // algunos navegadores lanzan si se llama fuera de un gesto del usuario; lo ignoramos
    }
  }
}
