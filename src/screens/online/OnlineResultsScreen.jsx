import { useEffect, useRef } from 'react'
import { useOnlineGame } from '../../state/onlineGameContext'
import Confetti from '../../components/Confetti'
import { playVictory } from '../../lib/sound'
import { vibrate } from '../../lib/haptics'

export default function OnlineResultsScreen() {
  const { players, isHost, playAgain, leaveRoom } = useOnlineGame()
  const ranked = [...players].sort((a, b) => b.score - a.score)
  const winner = ranked[0]
  const isTie = ranked.length > 1 && ranked[0].score === ranked[1].score
  const played = useRef(false)

  useEffect(() => {
    if (played.current) return
    played.current = true
    playVictory()
    vibrate([50, 50, 50, 50, 150])
  }, [])

  return (
    <div className="screen" style={{ alignItems: 'center', textAlign: 'center' }}>
      <Confetti count={60} />
      <p className="eyebrow" style={{ marginTop: 12 }}>
        Partida terminada
      </p>
      <h2 className="title" style={{ fontSize: 30 }}>
        {isTie ? '¡Empate en la cima! 🎉' : (
          <>
            <span className="trophy-glow">🏆</span> {winner?.name} arrasó
          </>
        )}
      </h2>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
        {ranked.map((p, i) => (
          <div
            key={p.id}
            className="card"
            style={{
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              border: i === 0 ? '2px solid var(--accent-yellow)' : undefined,
            }}
          >
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>
              {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`} {p.name}
            </span>
            <span style={{ fontWeight: 700, color: 'var(--accent-yellow)' }}>{p.score} pts</span>
          </div>
        ))}
      </div>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12, marginTop: 'auto' }}>
        {isHost ? (
          <button className="btn btn-primary btn-block" onClick={playAgain}>
            Jugar de nuevo
          </button>
        ) : (
          <p className="subtitle">Esperando a que el anfitrión inicie otra ronda…</p>
        )}
        <button className="btn btn-secondary btn-block" onClick={leaveRoom}>
          Salir de la sala
        </button>
      </div>
    </div>
  )
}
