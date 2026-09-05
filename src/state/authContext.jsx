import { createContext, useContext, useEffect, useState } from 'react'
import { Capacitor } from '@capacitor/core'
import { App as CapApp } from '@capacitor/app'
import { Browser } from '@capacitor/browser'
import { supabase } from '../lib/supabase'

// Debe coincidir con el appId de capacitor.config.ts + "://auth-callback".
// También hay que agregarlo en Supabase: Authentication > URL Configuration > Redirect URLs.
const NATIVE_REDIRECT_URL = 'com.verdadoreto.app://auth-callback'

const AuthContext = createContext(null)

export const AVATAR_EMOJIS = ['🦊', '🐼', '🦁', '🐸', '🐨', '🐯', '🐵', '🐰', '🐺', '🐱', '🐶', '🦄']
export const AVATAR_COLORS = ['#ff2d78', '#ffd23f', '#7b3fe4', '#5a2f9e', '#331d61', '#f5efff']

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined) // undefined = cargando, null = sin sesión
  const [profile, setProfile] = useState(null)
  const [loadingProfile, setLoadingProfile] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  // Solo aplica en Android/iOS nativo: cuando el navegador del sistema redirige
  // de vuelta a la app vía deep link, tomamos el token de la URL y cerramos el navegador.
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return
    const listener = CapApp.addListener('appUrlOpen', async ({ url }) => {
      if (!url.startsWith(NATIVE_REDIRECT_URL)) return
      const hash = url.split('#')[1]
      if (hash) {
        const params = new URLSearchParams(hash)
        const access_token = params.get('access_token')
        const refresh_token = params.get('refresh_token')
        if (access_token && refresh_token) {
          await supabase.auth.setSession({ access_token, refresh_token })
        }
      }
      await Browser.close()
    })
    return () => {
      listener.then((l) => l.remove())
    }
  }, [])

  useEffect(() => {
    const userId = session?.user?.id
    if (!userId) {
      setProfile(null)
      return
    }
    let cancelled = false
    setLoadingProfile(true)
    async function loadProfile() {
      // La fila de perfil la crea un trigger en el signup; puede tardar un instante en aparecer.
      for (let attempt = 0; attempt < 5; attempt++) {
        const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
        if (cancelled) return
        if (data) {
          setProfile(data)
          setLoadingProfile(false)
          return
        }
        await new Promise((r) => setTimeout(r, 400))
      }
      setLoadingProfile(false)
    }
    loadProfile()
    return () => {
      cancelled = true
    }
  }, [session?.user?.id])

  async function signInWithGoogle() {
    const isNative = Capacitor.isNativePlatform()
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: isNative ? NATIVE_REDIRECT_URL : window.location.href,
        skipBrowserRedirect: isNative,
      },
    })
    // En web, signInWithOAuth ya redirige solo. En nativo, abrimos el navegador del sistema
    // nosotros mismos con la URL que Supabase generó.
    if (isNative && !error && data?.url) {
      await Browser.open({ url: data.url })
    }
  }

  async function signInAsGuest() {
    const { error } = await supabase.auth.signInAnonymously()
    if (error) alert('ERROR: ' + error.message)
  }

  async function signOut() {
    await supabase.auth.signOut()
    setProfile(null)
  }

  async function updateProfile(patch) {
    if (!session?.user?.id) return
    const { data, error } = await supabase.from('profiles').update(patch).eq('id', session.user.id).select().single()
    if (!error) setProfile(data)
    return { data, error }
  }

  // Se llama al terminar una partida (rápida u online, si el anfitrión tiene sesión)
  // para sumar la actividad al perfil.
  async function recordGameResult({ truths = 0, daresCompleted = 0, daresFailed = 0, points = 0 }) {
    if (!session?.user?.id || !profile) return
    const patch = {
      games_played: profile.games_played + 1,
      truths_answered: profile.truths_answered + truths,
      dares_completed: profile.dares_completed + daresCompleted,
      dares_failed: profile.dares_failed + daresFailed,
      points_total: profile.points_total + points,
    }
    await updateProfile(patch)
  }

  const value = {
    session,
    user: session?.user ?? null,
    isLoadingSession: session === undefined,
    profile,
    loadingProfile,
    signInWithGoogle,
    signInAsGuest,
    signOut,
    updateProfile,
    recordGameResult,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
