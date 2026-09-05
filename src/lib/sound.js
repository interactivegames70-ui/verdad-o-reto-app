let ctx = null
let enabled = true
try {
  const stored = localStorage.getItem('vor_effects_enabled')
  enabled = stored === null ? true : stored === '1'
} catch {
  // localStorage puede no estar disponible (modo privado, etc.); seguimos con sonido activado
}

export function isEffectsEnabled() {
  return enabled
}

export function setEffectsEnabled(value) {
  enabled = value
  try {
    localStorage.setItem('vor_effects_enabled', value ? '1' : '0')
  } catch {
    // no pasa nada si no se puede persistir
  }
}

function getCtx() {
  if (!enabled) return null
  if (!ctx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) return null
    ctx = new AudioContextClass()
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function tone({ freq, duration = 0.12, type = 'sine', volume = 0.16, delay = 0, freqEnd }) {
  const audioCtx = getCtx()
  if (!audioCtx) return
  const osc = audioCtx.createOscillator()
  const gain = audioCtx.createGain()
  osc.type = type
  const startTime = audioCtx.currentTime + delay
  osc.frequency.setValueAtTime(freq, startTime)
  if (freqEnd) osc.frequency.exponentialRampToValueAtTime(freqEnd, startTime + duration)
  gain.gain.setValueAtTime(volume, startTime)
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration)
  osc.connect(gain)
  gain.connect(audioCtx.destination)
  osc.start(startTime)
  osc.stop(startTime + duration + 0.03)
}

// Microinteracción genérica: click de botón, breve y discreto
export function playClick() {
  tone({ freq: 720, duration: 0.05, type: 'square', volume: 0.05 })
}

export function playTick() {
  tone({ freq: 900, duration: 0.03, type: 'square', volume: 0.05 })
}

export function playCountdownTick(urgent) {
  tone({ freq: urgent ? 1100 : 850, duration: 0.05, type: 'square', volume: urgent ? 0.09 : 0.05 })
}

export function playBuzzer() {
  tone({ freq: 220, duration: 0.35, type: 'square', volume: 0.13 })
}

// Ruleta aterrizando
export function playLand() {
  tone({ freq: 660, duration: 0.14, type: 'triangle', volume: 0.15 })
  tone({ freq: 880, duration: 0.18, type: 'triangle', volume: 0.13, delay: 0.06 })
}

// Se revela una carta nueva
export function playReveal() {
  tone({ freq: 440, freqEnd: 660, duration: 0.22, type: 'sine', volume: 0.13 })
}

export function playSuccess() {
  tone({ freq: 523, duration: 0.1, type: 'sine', volume: 0.15 })
  tone({ freq: 659, duration: 0.1, type: 'sine', volume: 0.15, delay: 0.09 })
  tone({ freq: 784, duration: 0.16, type: 'sine', volume: 0.15, delay: 0.18 })
}

export function playFail() {
  tone({ freq: 300, freqEnd: 160, duration: 0.28, type: 'sawtooth', volume: 0.09 })
}

export function playVictory() {
  ;[523, 659, 784, 1046].forEach((freq, i) => tone({ freq, duration: 0.2, type: 'sine', volume: 0.14, delay: i * 0.12 }))
}
