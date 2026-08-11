import type { AuthProviderName } from './types'

export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL ?? 'https://api.idempotencia.andrescortes.dev'

/**
 * Base del gateway de IA (FastAPI sobre Ollama, compatible con OpenAI) — es
 * un backend aparte de `idempotencia-back`, con su propio dominio. Ya no es
 * decorativa: `aiApi.ts` la usa para *todas* las llamadas de gestión de
 * API-Keys (`/me/api-keys`), no solo para los ejemplos de código. Vacía por
 * defecto — sin definirla, todo el servicio de IA queda roto, no solo los
 * ejemplos.
 */
export const AI_GATEWAY_BASE_URL: string = import.meta.env.VITE_AI_GATEWAY_BASE_URL ?? ''

/**
 * URLs reales de arranque de OAuth. El backend hoy no redirige de vuelta al
 * frontend con el token (ver README) — así que estas URLs quedan listas para
 * cuando eso se resuelva, pero todavía no se usan desde la UI.
 */
export const OAUTH_URLS: Record<AuthProviderName, string> = {
  google: `${API_BASE_URL}/auth/google/login`,
  github: `${API_BASE_URL}/auth/github/login`,
}
