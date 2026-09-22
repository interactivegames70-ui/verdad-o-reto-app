import { useEffect, useState } from 'react'
import { fetchPendingCards, fetchReportedCards, moderateCard, dismissReports } from '../../lib/community'

const TYPE_LABEL = { truth: 'Verdad', dare: 'Reto' }

export default function AdminModerationScreen({ onBack }) {
  const [tab, setTab] = useState('pending') // 'pending' | 'reported'
  const [pending, setPending] = useState([])
  const [reported, setReported] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    const [{ data: pendingData }, { data: reportedData, error: reportedError }] = await Promise.all([
      fetchPendingCards(),
      fetchReportedCards(),
    ])
    setPending(pendingData)
    setReported(reportedData)
    if (reportedError) {
      console.error('Error al cargar reportes', reportedError)
      setError(
        'No se pudieron cargar los reportes. Puede que falte correr supabase-schema-reports.sql en Supabase.'
      )
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function decide(cardId, status) {
    setError('')
    const { error } = await moderateCard(cardId, status)
    if (error) {
      console.error('Error al moderar la carta', error)
      setError(
        'No se pudo guardar el cambio. Seguramente tu usuario no está marcado como admin en la base de datos (revisá supabase-schema-community.sql).'
      )
      return
    }
    setPending((prev) => prev.filter((c) => c.id !== cardId))
    setReported((prev) => prev.filter((c) => c.id !== cardId))
  }

  async function dismiss(cardId) {
    setError('')
    const { error } = await dismissReports(cardId)
    if (error) {
      console.error('Error al descartar los reportes', error)
      setError('No se pudieron descartar los reportes.')
      return
    }
    setReported((prev) => prev.filter((c) => c.id !== cardId))
  }

  const list = tab === 'pending' ? pending : reported

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
          {tab === 'pending' ? 'Cartas pendientes de revisión' : 'Cartas reportadas'}
        </h2>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          className={tab === 'pending' ? 'btn btn-primary' : 'btn btn-secondary'}
          style={{ flex: 1 }}
          onClick={() => setTab('pending')}
        >
          Pendientes{pending.length > 0 ? ` (${pending.length})` : ''}
        </button>
        <button
          className={tab === 'reported' ? 'btn btn-primary' : 'btn btn-secondary'}
          style={{ flex: 1 }}
          onClick={() => setTab('reported')}
        >
          Reportadas{reported.length > 0 ? ` (${reported.length})` : ''}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, overflowY: 'auto' }}>
        {loading && <p className="subtitle" style={{ textAlign: 'center' }}>Cargando…</p>}
        {error && (
          <p className="subtitle" style={{ textAlign: 'center', color: 'var(--accent-pink)' }}>
            {error}
          </p>
        )}
        {!loading && list.length === 0 && (
          <p className="subtitle" style={{ textAlign: 'center', marginTop: 12 }}>
            {tab === 'pending' ? 'No hay nada pendiente de revisión. 🎉' : 'No hay cartas reportadas. 🎉'}
          </p>
        )}
        {list.map((c) => (
          <div key={c.id} className="card" style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span style={{ fontSize: 13.5 }}>
              <strong>{TYPE_LABEL[c.type]} · N{c.level}</strong>
              <br />
              {c.text}
            </span>
            {tab === 'reported' && (
              <span className="subtitle" style={{ fontSize: 12 }}>
                🚩 Reportada {c.reportCount} {c.reportCount === 1 ? 'vez' : 'veces'}
                {c.reasons?.length > 0 ? ` — motivo: "${c.reasons[0]}"` : ''}
              </span>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              {tab === 'reported' && (
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => dismiss(c.id)}>
                  Descartar reportes
                </button>
              )}
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => decide(c.id, 'rejected')}>
                Rechazar
              </button>
              {tab === 'pending' && (
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => decide(c.id, 'approved')}>
                  Aprobar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
