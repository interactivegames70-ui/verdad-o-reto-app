export default function ExitGameButton({ onExit, label = '✕ Salir' }) {
  function handleClick() {
    if (window.confirm('¿Seguro que quieres salir de la partida?')) {
      onExit()
    }
  }

  return (
    <button
      onClick={handleClick}
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
  )
}
