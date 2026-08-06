import { apiFetch } from './httpClient'
import type { AiApiKey, AiApiKeyCredentials, AiUsageSummary } from './types'

/**
 * POST /ai/api-keys — solo `name` por ahora. El gateway acepta límites
 * opcionales (`requests_per_minute`, `daily_token_limit`, `monthly_token_limit`)
 * pero backend todavía no confirmó si el usuario los va a poder elegir desde
 * acá — arrancamos con lo mínimo garantizado, fácil de extender después.
 */
export async function createAiApiKey(name: string): Promise<AiApiKeyCredentials> {
  return apiFetch<AiApiKeyCredentials>('/ai/api-keys', {
    method: 'POST',
    body: JSON.stringify({ name }),
  })
}

/** GET /ai/api-keys — nunca la key completa, solo `keyPrefix`. Incluye revocadas. */
export async function getMyAiApiKeys(): Promise<AiApiKey[]> {
  return apiFetch<AiApiKey[]>('/ai/api-keys')
}

/** DELETE /ai/api-keys/{id} — soft delete (is_active=false), no borra la fila. */
export async function revokeAiApiKey(id: number): Promise<void> {
  await apiFetch<void>(`/ai/api-keys/${id}`, { method: 'DELETE' })
}

/** GET /ai/api-keys/{id}/usage — start/end son YYYY-MM-DD, end inclusive. */
export async function getAiApiKeyUsage(id: number, start: string, end: string): Promise<AiUsageSummary> {
  const params = new URLSearchParams({ start, end })
  return apiFetch<AiUsageSummary>(`/ai/api-keys/${id}/usage?${params.toString()}`)
}
