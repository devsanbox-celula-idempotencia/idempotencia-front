import { AI_GATEWAY_BASE_URL } from './config'
import { readStoredSession } from './session-storage'

export type AiKeyErrorCode =
  | 'invalid_token'
  | 'user_not_found'
  | 'not_found'
  | 'conflict'
  | 'invalid_request_error'
  | 'rate_limit_error'
  | 'feature_not_configured'
  | 'api_error'

const KNOWN_CODES: readonly AiKeyErrorCode[] = [
  'invalid_token',
  'user_not_found',
  'not_found',
  'conflict',
  'invalid_request_error',
  'rate_limit_error',
  'feature_not_configured',
  'api_error',
]

function toKnownCode(code: unknown): AiKeyErrorCode {
  return typeof code === 'string' && (KNOWN_CODES as string[]).includes(code) ? (code as AiKeyErrorCode) : 'api_error'
}

interface GatewayErrorBody {
  error?: { message?: string; type?: string; param?: string | null; code?: string }
}

/**
 * El gateway de IA responde errores en formato OpenAI, distinto al de la
 * plataforma (`{status,error}`) — por eso `code` es un tipo cerrado y no un
 * string libre: la UI debe ramificar por acá, nunca por `message` (texto
 * libre que puede cambiar). `requestId` (header `X-Request-ID`) es lo que
 * hay que pegar en un reporte de bug para encontrar la petición en logs.
 */
export class AiGatewayError extends Error {
  status: number
  code: AiKeyErrorCode
  requestId: string | null

  constructor(status: number, code: AiKeyErrorCode, message: string, requestId: string | null) {
    super(message)
    this.name = 'AiGatewayError'
    this.status = status
    this.code = code
    this.requestId = requestId
  }
}

/**
 * Fetch dedicado al gateway de IA — es un backend aparte de `idempotencia-back`,
 * con su propia base URL (`VITE_AI_GATEWAY_BASE_URL`) y su propio contrato de
 * error, así que no comparte `apiFetch`/`ApiError` del backend principal. La
 * credencial sigue siendo el mismo `Authorization: Bearer` de la sesión de la
 * plataforma — el gateway valida ese JWT por su cuenta y saca el `UserId` de
 * ahí. Nunca `credentials: 'include'`: la credencial viaja en el header, no
 * en cookies, y activarlo solo suma un preflight más estricto sin ganar nada.
 */
export async function aiGatewayFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const session = readStoredSession()

  let response: Response
  try {
    response = await fetch(`${AI_GATEWAY_BASE_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(session ? { Authorization: `Bearer ${session.token}` } : {}),
        ...init.headers,
      },
    })
  } catch {
    throw new AiGatewayError(
      0,
      'api_error',
      'No se pudo conectar con el servicio de IA. Verifica tu conexión e inténtalo de nuevo.',
      null,
    )
  }

  const requestId = response.headers.get('X-Request-ID')
  const contentType = response.headers.get('content-type') ?? ''
  const body = contentType.includes('application/json') ? await response.json().catch(() => null) : null

  if (!response.ok) {
    const gatewayError = (body as GatewayErrorBody | null)?.error
    const code = toKnownCode(gatewayError?.code)
    let message = gatewayError?.message ?? `Ocurrió un error (${response.status}).`
    if (code === 'rate_limit_error') {
      const retryAfter = response.headers.get('Retry-After')
      if (retryAfter) message = `${message} Intenta de nuevo en ${retryAfter}s.`
    }
    throw new AiGatewayError(response.status, code, message, requestId)
  }

  return body as T
}
