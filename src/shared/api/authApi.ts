import { OAUTH_URLS } from './config'
import { apiFetch } from './httpClient'
import { delay } from './mock/delay'
import { findOrCreateOAuthIdentity, trackAuthActivity } from './mock/mockStore'
import type { AuthProviderName, AuthResponse } from './types'

interface RegisterInput {
  email: string
  password: string
  fullName: string
}

interface LoginInput {
  email: string
  password: string
}

/** POST /auth/register — backend real. */
export async function registerWithPassword(input: RegisterInput): Promise<AuthResponse> {
  const authResponse = await apiFetch<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  trackAuthActivity(authResponse)
  return authResponse
}

/** POST /auth/login — backend real. */
export async function loginWithPassword(input: LoginInput): Promise<AuthResponse> {
  const authResponse = await apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  trackAuthActivity(authResponse)
  return authResponse
}

/**
 * OAuth simulado en cliente. Se mantiene disponible (no se usa desde la UI,
 * que ya redirige de verdad — ver `getOAuthRedirectUrl`) por si hace falta
 * volver a simular el flujo sin depender del backend.
 */
export async function authenticateWithProviderMock(
  provider: AuthProviderName,
): Promise<{ authResponse: AuthResponse; isNewUser: boolean }> {
  await delay(700)
  return findOrCreateOAuthIdentity(provider)
}

export function getOAuthRedirectUrl(provider: AuthProviderName): string {
  return OAUTH_URLS[provider]
}

/**
 * Registra en el store mock la actividad de una sesión que llegó por el
 * callback real de OAuth (ver pages/oauth-callback), para que las métricas
 * de la landing sigan siendo consistentes sin importar el método de auth.
 */
export function recordExternalSession(authResponse: AuthResponse): void {
  trackAuthActivity(authResponse)
}
