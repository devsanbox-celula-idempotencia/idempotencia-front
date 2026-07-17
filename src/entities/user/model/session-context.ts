import { createContext } from 'react'
import type { AuthResponse } from '@/shared/api'

export interface SessionContextValue {
  user: AuthResponse | null
  isAuthenticated: boolean
  setSession: (session: AuthResponse) => void
  clearSession: () => void
}

export const SessionContext = createContext<SessionContextValue | null>(null)
