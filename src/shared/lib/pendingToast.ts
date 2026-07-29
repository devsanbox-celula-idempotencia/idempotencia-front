/**
 * Puente en memoria para mostrar un mensaje de éxito una vez, justo después
 * de una navegación (ej. tras registrarse, el mensaje se consume recién en
 * el dashboard). Mismo patrón que `pendingDatabaseReveal.ts` y por la misma
 * razón: `location.state` se pierde en la carrera con los route guards.
 */
let pendingMessage: string | null = null

export function setPendingToast(message: string): void {
  pendingMessage = message
}

export function takePendingToast(): string | null {
  const value = pendingMessage
  pendingMessage = null
  return value
}
