import { useEffect, useState } from 'react'
import { LEVELS } from '../../data/content'
import { fetchAllAdminCards, addAdminCard, updateAdminCard, deleteAdminCard, bulkAddAdminCards } from '../../lib/adminCards'
import { parseCardsZip } from '../../lib/docxZipImport'

const EMPTY_FORM = { type: 'truth', level: 1, modality: 'ambas', groupMode: 'ambas', text: '', timerSeconds: 30 }

export default function AdminContentScreen({ onBack }) {
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [filterLevel, setFilterLevel] = useState('all')
  const [importPreview, setImportPreview] = useState(null) // { cards, skipped } | null
  const [importing, setImporting] = useState(false)
  const [parsingZip, setParsingZip] = useState(false)
  const [importResult, setImportResult] = useState(null)

  async function load() {
    setLoading(true)
    const { data } = await fetchAllAdminCards()
    setCards(data)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  function startEdit(card) {
    setEditingId(card.id)
    setForm({
      type: card.type,
      level: card.level,
      modality: card.modality,
      groupMode: card.group_mode,
      text: card.text,
      timerSeconds: card.timer_seconds ?? 30,
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(EMPTY_FORM)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.text.trim() || saving) return
    setSaving(true)
    if (editingId) {
      await updateAdminCard(editingId, {
        type: form.type,
        level: form.level,
        modality: form.modality,
        group_mode: form.groupMode,
        text: form.text.trim(),
        timer_seconds: form.type === 'dare' ? form.timerSeconds : null,
      })
    } else {
      await addAdminCard({
        type: form.type,
        level: form.level,
        modality: form.modality,
        groupMode: form.groupMode,
        text: form.text.trim(),
        timerSeconds: form.type === 'dare' ? form.timerSeconds : null,
      })
    }
    setSaving(false)
    cancelEdit()
    load()
  }

  async function handleDelete(id) {
    await deleteAdminCard(id)
    if (editingId === id) cancelEdit()
    load()
  }

  async function handleZipSelected(e) {
    const file = e.target.files?.[0]
    e.target.value = '' // permite volver a elegir el mismo archivo si hace falta
    if (!file) return
    setParsingZip(true)
    setImportResult(null)
    try {
      const { cards: parsed, skipped } = await parseCardsZip(file)
      setImportPreview({ cards: parsed, skipped })
    } catch (err) {
      setImportResult({ error: 'No se pudo leer el archivo. ¿Es un .zip válido?' })
    }
    setParsingZip(false)
  }

  async function confirmImport() {
    if (!importPreview || importing) return
    setImporting(true)
    const { inserted, error } = await bulkAddAdminCards(importPreview.cards)
    setImporting(false)
    setImportPreview(null)
    setImportResult({ inserted, error: error?.message ?? null })
    load()
  }

  function cancelImport() {
    setImportPreview(null)
  }

  const visibleCards = filterLevel === 'all' ? cards : cards.filter((c) => c.level === Number(filterLevel))


  return (
    <div className="screen">
      <div className="top-bar">
        <button className="back-btn" onClick={onBack}>
          ‹ Volver
        </button>
      </div>

      <div>
        <p className="eyebrow">Admin</p>
        <h2 className="title" style={{ fontSize: 24 }}>
          Contenido oficial
        </h2>
        <p className="subtitle" style={{ marginTop: 6 }}>
          Estas cartas se suman siempre al banco del juego, para todos.
        </p>
      </div>

      <div className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <p className="label" style={{ fontSize: 15 }}>
          Importar desde .zip
        </p>
        <p className="subtitle" style={{ fontSize: 13 }}>
          Subí un .zip con archivos .docx nombrados igual que siempre: "Reto - Nivel 2 (Modo presencial).docx",
          "Verdad - Nivel 3.docx", etc. Se agregan como una carta por línea.
        </p>
        <label className="btn btn-secondary btn-block" style={{ textAlign: 'center', cursor: 'pointer' }}>
          {parsingZip ? 'Leyendo el .zip…' : 'Elegir archivo .zip'}
          <input type="file" accept=".zip" onChange={handleZipSelected} disabled={parsingZip} style={{ display: 'none' }} />
        </label>

        {importResult && (
          <p className="subtitle" style={{ color: importResult.error ? 'var(--accent-pink)' : 'var(--accent-yellow)' }}>
            {importResult.error
              ? `Error: ${importResult.error}`
              : `✓ Se importaron ${importResult.inserted} cartas.`}
          </p>
        )}

        {importPreview && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p className="subtitle">
              Se encontraron <strong>{importPreview.cards.length}</strong> cartas para importar.
              {importPreview.skipped.length > 0 && (
                <>
                  <br />
                  ⚠️ No se pudieron clasificar {importPreview.skipped.length} archivo(s): {importPreview.skipped.join(', ')}
                </>
              )}
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={cancelImport} disabled={importing}>
                Cancelar
              </button>
              <button className="btn btn-yellow" style={{ flex: 1 }} onClick={confirmImport} disabled={importing}>
                {importing ? 'Importando…' : `Confirmar (${importPreview.cards.length})`}
              </button>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="option-grid">
          <button
            type="button"
            className={`option-card ${form.type === 'truth' ? 'selected' : ''}`}
            onClick={() => setForm((f) => ({ ...f, type: 'truth' }))}
          >
            <span className="icon">🗣️</span>
            <span className="label">Verdad</span>
          </button>
          <button
            type="button"
            className={`option-card ${form.type === 'dare' ? 'selected' : ''}`}
            onClick={() => setForm((f) => ({ ...f, type: 'dare' }))}
          >
            <span className="icon">🔥</span>
            <span className="label">Reto</span>
          </button>
        </div>

        <div>
          <p className="subtitle" style={{ marginBottom: 8 }}>
            Nivel
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            {LEVELS.map((lvl) => (
              <button
                key={lvl.id}
                type="button"
                onClick={() => setForm((f) => ({ ...f, level: lvl.id }))}
                className="btn"
                style={{
                  flex: 1,
                  padding: '10px 6px',
                  fontSize: 14,
                  background: form.level === lvl.id ? 'var(--accent-pink)' : 'rgba(255,255,255,0.06)',
                  color: form.level === lvl.id ? '#fff' : 'var(--text-muted)',
                }}
              >
                {lvl.id}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="subtitle" style={{ marginBottom: 8 }}>
            Modalidad
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            {['ambas', 'presencial', 'distancia'].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setForm((f) => ({ ...f, modality: m }))}
                className="btn"
                style={{
                  flex: 1,
                  padding: '10px 6px',
                  fontSize: 13,
                  background: form.modality === m ? 'var(--accent-pink)' : 'rgba(255,255,255,0.06)',
                  color: form.modality === m ? '#fff' : 'var(--text-muted)',
                }}
              >
                {m === 'ambas' ? 'Ambas' : m === 'presencial' ? 'Presencial' : 'A distancia'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="subtitle" style={{ marginBottom: 8 }}>
            Grupo
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            {['ambas', 'pareja', 'grupo'].map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setForm((f) => ({ ...f, groupMode: g }))}
                className="btn"
                style={{
                  flex: 1,
                  padding: '10px 6px',
                  fontSize: 13,
                  background: form.groupMode === g ? 'var(--accent-pink)' : 'rgba(255,255,255,0.06)',
                  color: form.groupMode === g ? '#fff' : 'var(--text-muted)',
                }}
              >
                {g === 'ambas' ? 'Ambas' : g === 'pareja' ? 'Pareja' : 'Grupo'}
              </button>
            ))}
          </div>
        </div>

        <textarea
          value={form.text}
          onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
          placeholder={form.type === 'truth' ? 'Escribí la pregunta… (podés usar #user)' : 'Escribí el reto… (podés usar #user)'}
          rows={3}
          maxLength={300}
          style={{
            width: '100%',
            background: 'var(--surface-card)',
            border: '1.5px solid rgba(255,255,255,0.1)',
            borderRadius: 14,
            padding: '14px 16px',
            color: 'var(--text-primary)',
            fontSize: 15,
            fontFamily: 'var(--font-body)',
            resize: 'vertical',
          }}
        />

        {form.type === 'dare' && (
          <div>
            <p className="subtitle" style={{ marginBottom: 8 }}>
              Tiempo: {form.timerSeconds}s
            </p>
            <input
              type="range"
              min={10}
              max={180}
              step={5}
              value={form.timerSeconds}
              onChange={(e) => setForm((f) => ({ ...f, timerSeconds: Number(e.target.value) }))}
              style={{ width: '100%' }}
            />
          </div>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          {editingId && (
            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={cancelEdit}>
              Cancelar
            </button>
          )}
          <button type="submit" className="btn btn-yellow" style={{ flex: 1 }} disabled={!form.text.trim() || saving}>
            {saving ? 'Guardando…' : editingId ? 'Guardar cambios' : 'Agregar carta'}
          </button>
        </div>
      </form>

      <div>
        <p className="subtitle" style={{ marginBottom: 10 }}>
          Filtrar por nivel
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            className="btn"
            onClick={() => setFilterLevel('all')}
            style={{
              padding: '8px 14px',
              fontSize: 13,
              background: filterLevel === 'all' ? 'var(--accent-pink)' : 'rgba(255,255,255,0.06)',
              color: filterLevel === 'all' ? '#fff' : 'var(--text-muted)',
            }}
          >
            Todos ({cards.length})
          </button>
          {LEVELS.map((lvl) => (
            <button
              key={lvl.id}
              className="btn"
              onClick={() => setFilterLevel(String(lvl.id))}
              style={{
                padding: '8px 14px',
                fontSize: 13,
                background: filterLevel === String(lvl.id) ? 'var(--accent-pink)' : 'rgba(255,255,255,0.06)',
                color: filterLevel === String(lvl.id) ? '#fff' : 'var(--text-muted)',
              }}
            >
              N{lvl.id}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, overflowY: 'auto' }}>
        {loading && (
          <p className="subtitle" style={{ textAlign: 'center', marginTop: 12 }}>
            Cargando…
          </p>
        )}
        {!loading && visibleCards.length === 0 && (
          <p className="subtitle" style={{ textAlign: 'center', marginTop: 12 }}>
            No hay cartas en este filtro.
          </p>
        )}
        {visibleCards.map((c) => (
          <div key={c.id} className="card" style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 13.5 }}>
              <strong>
                {c.type === 'truth' ? 'Verdad' : 'Reto'} · N{c.level} · {c.modality} · {c.group_mode}
              </strong>
              <br />
              {c.text}
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn btn-secondary"
                style={{ flex: 1, padding: '8px', fontSize: 13 }}
                onClick={() => startEdit(c)}
              >
                Editar
              </button>
              <button
                className="btn btn-secondary"
                style={{ flex: 1, padding: '8px', fontSize: 13, color: 'var(--accent-pink)' }}
                onClick={() => handleDelete(c.id)}
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
