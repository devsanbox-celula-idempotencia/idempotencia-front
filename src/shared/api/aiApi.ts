import { aiGatewayFetch } from './aiGatewayClient'
import { parseUtc } from '@/shared/lib/parseUtc'
import type { AiApiKey, AiApiKeyCredentials, AiUsageDay, AiUsageSummary } from './types'

/**
 * Formas tal cual las manda el gateway (`snake_case`, fechas UTC sin `Z`).
 * Se mapean a los tipos `camelCase` de `./types` acá mismo, en un solo
 * sitio, para que el resto de la app no tenga que pensar en el dialecto del
 * gateway ni en la corrección de fechas.
 */
interface AiKeyWire {
  id: number
  name: string
  key_prefix: string
  is_active: boolean
  created_at: string
  last_used_at: string | null
  expires_at: string | null
  daily_token_limit: number | null
  requests_per_minute: number | null
}

interface AiKeyCreatedWire {
  id: number
  name: string
  api_key: string
  created_at: string
  base_url: string
  model: string
}

interface AiUsageWire {
  api_key_id: number | null
  total_requests: number
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
  days: Array<{
    day: string
    requests: number
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }>
}

function toUtcIso(value: string): string
function toUtcIso(value: string | null): string | null
function toUtcIso(value: string | null): string | null {
  return value === null ? null : parseUtc(value).toISOString()
}

function mapKey(wire: AiKeyWire): AiApiKey {
  return {
    id: wire.id,
    name: wire.name,
    keyPrefix: wire.key_prefix,
    isActive: wire.is_active,
    createdAt: toUtcIso(wire.created_at),
    lastUsedAt: toUtcIso(wire.last_used_at),
    expiresAt: toUtcIso(wire.expires_at),
    dailyTokenLimit: wire.daily_token_limit,
    requestsPerMinute: wire.requests_per_minute,
  }
}

/**
 * POST /me/api-keys — el gateway de IA (no `idempotencia-back`) valida el
 * JWT de la plataforma por su cuenta. Nunca mandar límites de consumo: el
 * endpoint los ignora a propósito, los fija el operador.
 */
export async function createAiApiKey(name: string): Promise<AiApiKeyCredentials> {
  const wire = await aiGatewayFetch<AiKeyCreatedWire>('/me/api-keys', {
    method: 'POST',
    body: JSON.stringify({ name }),
  })
  return {
    id: wire.id,
    name: wire.name,
    apiKey: wire.api_key,
    createdAt: toUtcIso(wire.created_at),
    baseUrl: wire.base_url,
    model: wire.model,
  }
}

/** GET /me/api-keys — incluye las revocadas (soft delete); el badge distingue estado. */
export async function getMyAiApiKeys(): Promise<AiApiKey[]> {
  const wire = await aiGatewayFetch<AiKeyWire[]>('/me/api-keys')
  return wire.map(mapKey)
}

/** DELETE /me/api-keys/{id} — soft delete, sin cuerpo. Efecto inmediato en la siguiente petición. */
export async function revokeAiApiKey(id: number): Promise<void> {
  await aiGatewayFetch<void>(`/me/api-keys/${id}`, { method: 'DELETE' })
}

/** GET /me/api-keys/{id}/usage?start=&end= — un rango invertido se corrige solo, no hace falta validarlo. */
export async function getAiApiKeyUsage(id: number, start: string, end: string): Promise<AiUsageSummary> {
  const params = new URLSearchParams({ start, end })
  const wire = await aiGatewayFetch<AiUsageWire>(`/me/api-keys/${id}/usage?${params.toString()}`)
  return {
    apiKeyId: wire.api_key_id,
    totalRequests: wire.total_requests,
    promptTokens: wire.prompt_tokens,
    completionTokens: wire.completion_tokens,
    totalTokens: wire.total_tokens,
    days: wire.days.map(
      (d): AiUsageDay => ({
        day: d.day,
        requests: d.requests,
        promptTokens: d.prompt_tokens,
        completionTokens: d.completion_tokens,
        totalTokens: d.total_tokens,
      }),
    ),
  }
}
