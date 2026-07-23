import { API_BASE_URL } from './config'
import { readStoredSession } from './session-storage'

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/**
 * Formato de error confirmado contra el backend real: `{ status, error }`
 * (ej. `{"status":500,"error":"Ocurrió un error al procesar la solicitud."}`).
 * Se mantienen los fallbacks a `title`/`message`/`errors` (estilo ProblemDetails
 * de ASP.NET) por si los endpoints de validación (sección 7.1, aún no
 * documentada) usan una forma distinta a la de este error genérico.
 */
interface ErrorBodyLike {
  error?: string
  title?: string
  message?: string
  errors?: Record<string, string[] | string>
}

function extractErrorMessage(body: unknown, fallback: string): string {
  if (!body || typeof body !== 'object') return fallback
  const problem = body as ErrorBodyLike

  if (problem.errors && typeof problem.errors === 'object') {
    const messages = Object.values(problem.errors).flatMap((value) =>
      Array.isArray(value) ? value : [value],
    )
    if (messages.length > 0) return messages.join(' ')
  }

  if (typeof problem.error === 'string' && problem.error) return problem.error
  if (typeof problem.message === 'string' && problem.message) return problem.message
  if (typeof problem.title === 'string' && problem.title) return problem.title
  return fallback
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const session = readStoredSession()

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(session ? { Authorization: `Bearer ${session.token}` } : {}),
        ...init.headers,
      },
    })
  } catch {
    throw new ApiError(0, 'No se pudo conectar con el servidor. Verifica tu conexión e inténtalo de nuevo.')
  }

  const contentType = response.headers.get('content-type') ?? ''
  const body = contentType.includes('application/json') ? await response.json().catch(() => null) : null

  if (response.status === 429) {
    const retryAfter = response.headers.get('Retry-After')
    const baseMessage = extractErrorMessage(body, 'Demasiadas solicitudes.')
    const message = retryAfter ? `${baseMessage} Intenta de nuevo en ${retryAfter}s.` : baseMessage
    throw new ApiError(429, message)
  }

  if (!response.ok) {
    throw new ApiError(response.status, extractErrorMessage(body, `Ocurrió un error (${response.status}).`))
  }

  return body as T
}
