import { useEffect, useState } from 'react'
import { useAuth } from '../../state/authContext'
import { fetchApprovedCards, fetchMyLikedCardIds, toggleCardLike } from '../../lib/community'

const TYPE_LABEL = { truth: 'Verdad', dare: 'Reto' }

export default function CommunityScreen({ onBack, onCreate, onModerate }) {
  const { user, profile } = useAuth()
  const [cards, setCards] = useState([])
  const [likedIds, setLikedIds] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('all') // all | truth | dare

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      const { data } = await fetchApprovedCards({})
      if (cancelled) return
      setCards(data)
      if (user) setLikedIds(await fetchMyLikedCardIds(user.id))
      setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [user])

  async function handleLike(cardId) {
    if (!user) return
    const wasLiked = likedIds.has(cardId)
    // optimista: refleja el cambio antes de la respuesta del servidor
    setLikedIds((prev) => {
      const next = new Set(prev)
      wasLiked ? next.delete(cardId) : next.add(cardId)
      return next
    })
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, likes_count: c.likes_count + (wasLiked ? -1 : 1) } : c))
    )
    await toggleCardLike(cardId)
  }

  const visible = cards.filter((c) => typeFilter === 'all' || c.type === typeFilter)

  return (
    <div className="screen">
      <div className="top-bar">
        <button className="back-btn" onClick={onBack}>
          ‹ Volver
        </button>
        {profile?.is_admin && (
          <button className="progress-pill" onClick={onModerate}>
            Moderar
          </button>
        )}
      </div>

      <div>
        <p className="eyebrow">Contenido de la comunidad</p>
        <h2 className="title" style={{ fontSize: 26 }}>
          Preguntas y retos de otros jugadores
        </h2>
      </div>

      <div className="option-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {[
          { id: 'all', label: 'Todas' },
          { id: 'truth', label: 'Verdad' },
          { id: 'dare', label: 'Reto' },
        ].map((f) => (
          <button
            key={f.id}
            className={`option-card ${typeFilter === f.id ? 'selected' : ''}`}
            style={{ padding: '10px 6px' }}
            onClick={() => setTypeFilter(f.id)}
          >
            <span className="label" style={{ fontSize: 13.5 }}>{f.label}</span>
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, overflowY: 'auto' }}>
        {loading && <p className="subtitle" style={{ textAlign: 'center' }}>Cargando…</p>}
        {!loading && visible.length === 0 && (
          <p className="subtitle" style={{ textAlign: 'center', marginTop: 12 }}>
            Todavía no hay cartas aprobadas de la comunidad.
          </p>
        )}
        {visible.map((c) => (
          <div key={c.id} className="card" style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 13.5 }}>
              <strong>{TYPE_LABEL[c.type]} · N{c.level}</strong>
              <br />
              {c.text}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="subtitle" style={{ fontSize: 12 }}>Usada {c.uses_count} veces</span>
              <button
                onClick={() => handleLike(c.id)}
                disabled={!user}
                style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 4, padding: 6 }}
              >
                <span style={{ fontSize: 16 }}>{likedIds.has(c.id) ? '❤️' : '🤍'}</span>
                <span style={{ fontSize: 13, fontWeight: 700 }}>{c.likes_count}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <button className="btn btn-primary btn-block" onClick={onCreate}>
        + Enviar una pregunta o reto
      </button>
    </div>
  )
}
