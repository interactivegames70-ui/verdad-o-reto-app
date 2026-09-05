import { useState } from 'react'
import { useGame } from '../state/gameContext'
import { fetchApprovedCards } from '../lib/community'

const MIN_PLAYERS = { pareja: 2, grupo: 3 }

export default function PlayersScreen() {
  const { state, dispatch } = useGame()
  const [name, setName] = useState('')
  const [loadingCommunity, setLoadingCommunity] = useState(false)
  const min = MIN_PLAYERS[state.group] ?? 2
  const max = state.group === 'pareja' ? 2 : 12

  function addPlayer() {
    if (state.players.length >= max) return
    dispatch({ type: 'ADD_PLAYER', name })
    setName('')
  }

  async function toggleCommunity() {
    const enabling = !state.communityEnabled
    dispatch({ type: 'SET_COMMUNITY_ENABLED', enabled: enabling })
    if (!enabling) return
    setLoadingCommunity(true)
    const { data } = await fetchApprovedCards({ group: state.group, modality: state.modality })
    const mapped = data.map((c) => ({
      communityId: c.id,
      type: c.type,
      level: c.level,
      modality: c.modality,
      group: c.group_mode,
      text: c.text,
      timerSeconds: c.timer_seconds ?? undefined,
    }))
    dispatch({ type: 'SET_COMMUNITY_CARDS', cards: mapped })
    setLoadingCommunity(false)
  }

  return (
    <div className="screen">
      <div className="top-bar">
        <button className="back-btn" onClick={() => dispatch({ type: 'GO_SETUP' })}>
          ‹ Volver
        </button>
      </div>

      <div>
        <p className="eyebrow">Paso 2 de 2</p>
        <h2 className="title" style={{ fontSize: 26 }}>
          ¿Quiénes juegan?
        </h2>
        <p className="subtitle" style={{ marginTop: 6 }}>
          {state.group === 'pareja' ? 'Necesitas 2 jugadores.' : `Mínimo ${min} jugadores.`}
        </p>
      </div>

      <form
        style={{ display: 'flex', gap: 10 }}
        onSubmit={(e) => {
          e.preventDefault()
          addPlayer()
        }}
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre del jugador"
          maxLength={18}
          disabled={state.players.length >= max}
          style={{
            flex: 1,
            background: 'var(--surface-card)',
            border: '1.5px solid rgba(255,255,255,0.1)',
            borderRadius: 14,
            padding: '14px 16px',
            color: 'var(--text-primary)',
            fontSize: 15,
            fontFamily: 'var(--font-body)',
          }}
        />
        <button type="submit" className="btn btn-yellow" disabled={!name.trim() || state.players.length >= max}>
          Agregar
        </button>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        {state.players.map((p, i) => (
          <div
            key={p.id}
            className="card"
            style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>
              {PLAYER_EMOJIS[i % PLAYER_EMOJIS.length]} {p.name}
            </span>
            <button
              onClick={() => dispatch({ type: 'REMOVE_PLAYER', id: p.id })}
              aria-label={`Quitar a ${p.name}`}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 18, padding: 12, minWidth: 44, minHeight: 44 }}
            >
              ✕
            </button>
          </div>
        ))}
        {state.players.length === 0 && (
          <p className="subtitle" style={{ textAlign: 'center', marginTop: 20 }}>
            Todavía no agregaste jugadores.
          </p>
        )}
      </div>

      <button
        className="btn btn-secondary btn-block"
        style={{ fontSize: 14, padding: '12px 16px' }}
        onClick={() => dispatch({ type: 'GO_CUSTOM' })}
      >
        + Agregar preguntas o retos propios{state.customCards.length > 0 ? ` (${state.customCards.length})` : ''}
      </button>

      <button
        className="btn btn-secondary btn-block"
        style={{ fontSize: 14, padding: '12px 16px' }}
        onClick={toggleCommunity}
        disabled={loadingCommunity}
      >
        {loadingCommunity
          ? 'Cargando contenido de la comunidad…'
          : state.communityEnabled
            ? `✓ Contenido de la comunidad activado (${state.communityCards.length})`
            : 'Sumar contenido de la comunidad'}
      </button>

      <button
        className="btn btn-primary btn-block"
        disabled={state.players.length < min}
        onClick={() => dispatch({ type: 'START_GAME' })}
      >
        Empezar a jugar
      </button>
    </div>
  )
}

const PLAYER_EMOJIS = ['🦊', '🐼', '🦁', '🐸', '🐨', '🐯', '🐵', '🐰', '🐺', '🐱', '🐶', '🦄']
