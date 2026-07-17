import { useMemo, useState, type ReactNode } from 'react'
import type { AuthResponse } from '@/shared/api'
import { clearStoredSession, readStoredSession, writeStoredSession } from '@/shared/api/session-storage'
import { SessionContext, type SessionContextValue } from './session-context'

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthResponse | null>(() => readStoredSession())

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
