import type { AuthResponse } from './types'

/**
 * Única fuente de verdad para leer/escribir la sesión en localStorage.
 * La usan tanto `httpClient` (header Authorization) como `entities/user`
 * (contexto de React) — así `shared` no necesita importar de `entities`.
 */

const SESSION_STORAGE_KEY = 'idempotencia:session:v1'

function isExpired(session: AuthResponse): boolean {
  return Date.now() >= new Date(session.expiresAt).getTime()
}

export function readStoredSession(): AuthResponse | null {
  const raw = localStorage.getItem(SESSION_STORAGE_KEY)
  if (!raw) return null

  let session: AuthResponse
  try {
    session = JSON.parse(raw) as AuthResponse
  } catch {
    return null
  }

  if (isExpired(session)) {
    localStorage.removeItem(SESSION_STORAGE_KEY)
    return null
  }

  return session
}

export function writeStoredSession(session: AuthResponse): void {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
}

export function clearStoredSession(): void {
  localStorage.removeItem(SESSION_STORAGE_KEY)
}
