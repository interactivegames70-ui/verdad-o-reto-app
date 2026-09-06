import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

function showFatalError(message) {
  const pre = document.createElement('pre')
  pre.style.cssText =
    'position:fixed;inset:0;z-index:99999;margin:0;padding:20px;background:#3a0d1f;color:#fff;' +
    'font:13px/1.4 monospace;white-space:pre-wrap;overflow:auto;'
  pre.textContent = message
  document.body.appendChild(pre)
}

window.addEventListener('error', (e) => {
  showFatalError('ERROR: ' + e.message + '\n' + (e.error && e.error.stack ? e.error.stack : ''))
})
window.addEventListener('unhandledrejection', (e) => {
  showFatalError('PROMISE REJECTION: ' + (e.reason && e.reason.message ? e.reason.message : String(e.reason)))
})

try {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
} catch (err) {
  showFatalError('RENDER ERROR: ' + err.message + '\n' + err.stack)
}
