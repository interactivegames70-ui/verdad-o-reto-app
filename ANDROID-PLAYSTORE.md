# Verdad o Reto → Android / Play Store

Este proyecto ya viene con Capacitor instalado y configurado. Lo que falta lo tienes
que hacer tú porque requiere Android Studio (no disponible en este entorno).

## Lo que ya está hecho
- `@capacitor/core`, `@capacitor/android`, `@capacitor/app`, `@capacitor/browser` instalados
- `capacitor.config.ts` con appId `com.verdadoreto.app` y webDir `dist`
- Carpeta `android/` generada (proyecto nativo completo)
- Login de Google adaptado: en el celular se abre en el navegador del sistema
  (Chrome Custom Tabs) en vez del WebView interno, porque Google bloquea el login
  dentro de WebViews por seguridad. Al terminar, vuelve a la app por deep link.
- Deep link `com.verdadoreto.app://auth-callback` registrado en el AndroidManifest.

## ⚠️ Antes de tu primer build: decide el App ID
`com.verdadoreto.app` es el ID que puse por defecto. **No se puede cambiar después
de publicar en Play Store.** Si quieres otro (ej. `com.tuempresa.verdadoreto`):
1. Cámbialo en `capacitor.config.ts`
2. Búscalo y reemplázalo también en `src/state/authContext.jsx` (`NATIVE_REDIRECT_URL`)
   y en `android/app/src/main/AndroidManifest.xml` (el `android:scheme`)
3. Corre `npx cap sync android` de nuevo

## Configurar el redirect en Supabase (obligatorio para el login)
En el dashboard de Supabase: **Authentication → URL Configuration → Redirect URLs**,
agrega:
```
com.verdadoreto.app://auth-callback
```
(o el esquema que hayas elegido en el paso anterior)

## Pasos para generar el instalable

Necesitas [Android Studio](https://developer.android.com/studio) instalado.

1. Instalar dependencias y abrir el proyecto:
   ```bash
   npm install
   npm run android:open
   ```
   Esto compila la app web, sincroniza con Android y abre Android Studio.
   (La primera vez Android Studio va a descargar componentes del SDK — dale tiempo.)

2. Probar en un emulador o celular conectado (▶️ Run en Android Studio) antes de
   generar el paquete final. Prueba especialmente:
   - Login con Google (abre navegador → vuelve a la app)
   - Partida online (Supabase Realtime vía WebSocket)
   - Sonido y vibración

3. Generar íconos adaptativos: clic derecho en `android/app/src/main/res` →
   `New → Image Asset`, sube tu ícono (idealmente 1024x1024) y Android Studio genera
   todos los tamaños. Ahora mismo el proyecto trae el ícono genérico de Capacitor.

4. Generar el paquete firmado:
   `Build → Generate Signed Bundle / APK → Android App Bundle (.aab)`
   - Crea un nuevo keystore (`Create new...`) la primera vez.
   - **Guarda el archivo .jks y las contraseñas en un lugar seguro y respaldado.**
     Si lo pierdes, no podrás volver a actualizar la app en Play Store — tendrías
     que publicarla como app nueva.

5. Cada vez que cambies código: repite `npm run android:sync` (o `android:open`)
   antes de generar un nuevo build — Capacitor no hace esto automático.

## Cuenta de Google Play Console
- USD 25, pago único: https://play.google.com/console/signup
- Necesitarás: ícono 512x512, al menos 2 capturas de pantalla del teléfono,
  descripción corta y larga, política de privacidad (URL pública — obligatoria
  porque hay login de Google y se guardan datos de usuario en Supabase),
  y completar el cuestionario de clasificación de contenido.

## Nota sobre el contenido +18
Dependiendo de la intensidad de las cartas en niveles 3-4, probablemente debas
marcar la app con restricción de edad (17+ o equivalente) en el cuestionario de
clasificación de contenido de Play Console.
