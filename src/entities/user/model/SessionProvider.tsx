import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { AuthResponse } from '@/shared/api'
import { clearStoredSession, readStoredSession, writeStoredSession } from '@/shared/api/session-storage'
import { SessionContext, type SessionContextValue } from './session-context'

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthResponse | null>(() => readStoredSession())

  // El botón "atrás" del navegador puede restaurar una página anterior desde
  // el bfcache en vez de volver a montarla: el JS queda congelado tal cual
  // estaba (ej. `user` en null, si esa página se cargó antes de iniciar
  // sesión), y los guardianes de ruta (RequireAuth/RequireGuest) no vuelven a
  // evaluar nada porque no hay remount. `pageshow` con `persisted: true` es
  // la señal de que se restauró desde bfcache — ahí releemos localStorage y
  // forzamos el re-render, que es lo que dispara la redirección correcta.
  useEffect(() => {
    function handlePageShow(event: PageTransitionEvent) {
      if (event.persisted) setUser(readStoredSession())
    }
    window.addEventListener('pageshow', handlePageShow)
    return () => window.removeEventListener('pageshow', handlePageShow)
  }, [])

  const value = useMemo<SessionContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      setSession: (session: AuthResponse) => {
        writeStoredSession(session)
        setUser(session)
      },
      clearSession: () => {
        clearStoredSession()
        setUser(null)
      },
    }),
    [user],
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}
