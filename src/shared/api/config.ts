import type { AuthProviderName } from './types'

export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL ?? 'https://api.idempotencia.andrescortes.dev'

/**
 * Base pública del gateway de IA (FastAPI sobre Ollama, compatible con
 * OpenAI) — todavía no confirmada por backend (ver correciones_a_aconsiderar_backend.md
 * o el hilo de IA). Vacío hasta entonces; los ejemplos de uso muestran un
 * placeholder en su lugar, nunca una URL inventada.
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
