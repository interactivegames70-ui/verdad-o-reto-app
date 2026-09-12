import { useState } from 'react'

export default function ExitGameButton({ onExit, label = '✕ Salir' }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Salir de la partida"
        style={{
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.14)',
          borderRadius: 999,
          color: 'var(--text-muted)',
          fontSize: 13,
          fontWeight: 700,
          padding: '8px 14px',
          minHeight: 36,
        }}
      >
        {label}
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(8, 4, 18, 0.72)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: 24,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="card"
            style={{
              width: '100%',
              maxWidth: 340,
              padding: '24px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
              textAlign: 'center',
            }}
          >
            <p className="title" style={{ fontSize: 19, margin: 0 }}>
              ¿Seguro que quieres salir de la partida?
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setOpen(false)}>
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={() => {
                  setOpen(false)
                  onExit()
                }}
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
