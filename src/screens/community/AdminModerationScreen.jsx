import { useEffect, useState } from 'react'
import { fetchPendingCards, moderateCard } from '../../lib/community'

const TYPE_LABEL = { truth: 'Verdad', dare: 'Reto' }

export default function AdminModerationScreen({ onBack }) {
  const [pending, setPending] = useState([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const { data } = await fetchPendingCards()
    setPending(data)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function decide(cardId, status) {
    setPending((prev) => prev.filter((c) => c.id !== cardId))
    await moderateCard(cardId, status)
  }

  return (
    <div className="screen">
      <div className="top-bar">
        <button className="back-btn" onClick={onBack}>
          ‹ Volver
        </button>
      </div>

      <div>
        <p className="eyebrow">Panel de moderación</p>
        <h2 className="title" style={{ fontSize: 24 }}>
          Cartas pendientes de revisión
        </h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, overflowY: 'auto' }}>
        {loading && <p className="subtitle" style={{ textAlign: 'center' }}>Cargando…</p>}
        {!loading && pending.length === 0 && (
          <p className="subtitle" style={{ textAlign: 'center', marginTop: 12 }}>
            No hay nada pendiente de revisión. 🎉
          </p>
        )}
        {pending.map((c) => (
          <div key={c.id} className="card" style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span style={{ fontSize: 13.5 }}>
              <strong>{TYPE_LABEL[c.type]} · N{c.level}</strong>
              <br />
              {c.text}
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => decide(c.id, 'rejected')}>
                Rechazar
              </button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => decide(c.id, 'approved')}>
                Aprobar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
