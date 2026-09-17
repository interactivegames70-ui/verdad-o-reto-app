import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// La web se sirve en GitHub Pages bajo /verdad-o-reto-app/, pero la app de
// Android carga los archivos localmente desde la raíz. Por eso el build para
// Android usa --mode capacitor (ver package.json), que fuerza base: '/'.
export default defineConfig(({ mode }) => ({
  base: mode === 'capacitor' ? '/' : '/verdad-o-reto-app/',
  plugins: [react()],
}))
