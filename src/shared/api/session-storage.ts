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

/**
 * `mySqlDatabase` nunca se persiste: trae `password`/`connectionUri`, tan
 * sensibles como la contraseña de la cuenta, y de todos modos el dashboard
 * ya las consume una sola vez desde el puente en memoria
 * (`pendingDatabaseReveal.ts`) antes de llegar acá — no hace falta guardarlas
 * de nuevo en localStorage, donde quedarían indefinidamente hasta el logout.
 */
export function writeStoredSession(session: AuthResponse): void {
  const toPersist: AuthResponse = { ...session, mySqlDatabase: null }
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(toPersist))
}

export function clearStoredSession(): void {
  localStorage.removeItem(SESSION_STORAGE_KEY)
}
