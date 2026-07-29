import type { DatabaseCredentials } from '@/shared/api'

/**
 * Puente en memoria entre el login/register por contraseña (donde el backend
 * puede devolver `mySqlDatabase` recién aprovisionada) y el dashboard, que la
 * revela una única vez. No se usa `location.state` porque `RequireGuest`
 * dispara su propio `<Navigate>` sin state en cuanto la sesión se marca como
 * autenticada, compitiendo con la navegación explícita y perdiéndolo.
 */
let pending: DatabaseCredentials | null = null

export function setPendingDatabaseReveal(credentials: DatabaseCredentials): void {
  pending = credentials
}

export function takePendingDatabaseReveal(): DatabaseCredentials | null {
  const value = pending
  pending = null
  return value
}
