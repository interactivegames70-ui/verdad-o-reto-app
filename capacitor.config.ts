import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  // ⚠️ Este ID queda fijado para siempre en Play Store una vez publiques.
  // Cámbialo ANTES de tu primer build si "com.verdadoreto.app" no te sirve.
  appId: 'com.verdadoreto.app',
  appName: 'Verdad o Reto',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
}

export default config
