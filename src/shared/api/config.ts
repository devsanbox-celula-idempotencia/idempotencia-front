import type { AuthProviderName } from './types'

export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL ?? 'https://api.idempotencia.andrescortes.dev'

/**
 * URLs reales de arranque de OAuth. El backend hoy no redirige de vuelta al
 * frontend con el token (ver README) — así que estas URLs quedan listas para
 * cuando eso se resuelva, pero todavía no se usan desde la UI.
 */
export const OAUTH_URLS: Record<AuthProviderName, string> = {
  google: `${API_BASE_URL}/auth/google/login`,
  github: `${API_BASE_URL}/auth/github/login`,
}
