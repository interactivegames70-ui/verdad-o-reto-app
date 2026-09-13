import { useState } from 'react'
import { searchProfiles } from '../../lib/social'

export default function UserSearchScreen({ onBack, onOpenProfile }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  async function handleSearch() {
    if (!query.trim() || loading) return
    setLoading(true)
    setSearched(true)
    const { data } = await searchProfiles(query)
    setResults(data)
    setLoading(false)
  }

  return (
    <div className="screen">
      <div className="top-bar">
        <button className="back-btn" onClick={onBack}>
          ‹ Volver
        </button>
      </div>

      <h2 className="title" style={{ fontSize: 24 }}>Buscar jugadores</h2>

      <div style={{ display: 'flex', gap: 8 }}>
        <input
          className="text-input"
          style={{ flex: 1 }}
          value={query}
          maxLength={20}
          placeholder="Nombre de usuario…"
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSearch()
          }}
        />
        <button className="btn btn-primary" disabled={!query.trim() || loading} onClick={handleSearch}>
          Buscar
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {loading && <p className="subtitle" style={{ textAlign: 'center' }}>Buscando…</p>}
        {!loading && searched && results.length === 0 && (
          <p className="subtitle" style={{ textAlign: 'center' }}>No encontramos jugadores con ese nombre.</p>
        )}
        {results.map((p) => (
          <button
            key={p.id}
            className="card"
            style={{ display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left', width: '100%' }}
            onClick={() => onOpenProfile(p.id)}
          >
            <span
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: p.avatar_color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                flexShrink: 0,
              }}
            >
              {p.avatar_emoji}
            </span>
            <span style={{ fontWeight: 700 }}>{p.username}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
