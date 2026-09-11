import { useRef, useState } from 'react'
import { useGame } from '../state/gameContext'
import { useAuth } from '../state/authContext'
import { isEffectsEnabled, setEffectsEnabled } from '../lib/sound'

const SECRET_TAPS_NEEDED = 7
const SECRET_TAP_WINDOW_MS = 1500

export default function HomeScreen({ onGoOnline, onGoAccount, onSecretAdminTap }) {
  const { dispatch } = useGame()
  const { user, profile } = useAuth()
  const [effectsOn, setEffectsOn] = useState(isEffectsEnabled())
  const tapCountRef = useRef(0)
  const tapTimerRef = useRef(null)

  function handleDiceTap() {
    tapCountRef.current += 1
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current)
    if (tapCountRef.current >= SECRET_TAPS_NEEDED) {
      tapCountRef.current = 0
      onSecretAdminTap?.()
      return
    }
    tapTimerRef.current = setTimeout(() => {
      tapCountRef.current = 0
    }, SECRET_TAP_WINDOW_MS)
  }

  return (
    <div className="screen" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: 32 }}>
      <div className="top-bar" style={{ justifyContent: 'flex-end', gap: 10 }}>
        <button
          onClick={() => {
            const next = !effectsOn
            setEffectsEnabled(next)
            setEffectsOn(next)
          }}
          aria-label={effectsOn ? 'Silenciar efectos' : 'Activar efectos'}
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
            border: '1.5px solid rgba(255,255,255,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
          }}
        >
          {effectsOn ? '🔊' : '🔇'}
        </button>
        <button
          onClick={onGoAccount}
          aria-label="Mi cuenta"
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: user && profile ? profile.avatar_color : 'rgba(255,255,255,0.08)',
            border: '1.5px solid rgba(255,255,255,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
          }}
        >
          {user && profile ? profile.avatar_emoji : '🙋'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
        <div
          className="hero-badge"
          aria-hidden="true"
          onClick={handleDiceTap}
          style={{
            width: 96,
            height: 96,
            borderRadius: 28,
            background: 'linear-gradient(155deg, var(--accent-pink), var(--accent-pink-dim))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 46,
            boxShadow: '0 16px 36px -8px rgba(255,45,120,0.6)',
            marginBottom: 4,
          }}
        >
          🎲
        </div>
        <h1 className="title" style={{ fontSize: 46, letterSpacing: '-0.01em' }}>
          Verdad <span style={{ color: 'var(--accent-yellow)' }}>o</span> Reto
        </h1>
        <p className="subtitle" style={{ fontSize: 16 }}>Gira, elige y anímate.</p>
      </div>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button className="btn btn-primary btn-block" onClick={() => dispatch({ type: 'GO_CONTENT_CHOICE' })}>
          Partida rápida
        </button>
        <button className="btn btn-secondary btn-block" onClick={onGoOnline}>
          Partida online
        </button>
      </div>
    </div>
  )
}
