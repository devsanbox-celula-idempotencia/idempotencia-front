import { apiFetch } from './httpClient'
import { trackDatabaseCreated } from './mock/mockStore'
import type { DatabaseCredentials, DatabaseDetail, DatabaseEngine, DatabaseRecord } from './types'

/** POST /databases — backend real. La contraseña solo viene en esta respuesta, no se puede recuperar después. */
export async function createDatabase(
  engine: DatabaseEngine,
  dbName: string,
  maxConcurrentConnections?: number,
): Promise<DatabaseCredentials> {
  const credentials = await apiFetch<DatabaseCredentials>('/databases', {
    method: 'POST',
    body: JSON.stringify({ engine, dbName, maxConcurrentConnections }),
  })
  trackDatabaseCreated(credentials.status === 'Active')
  return credentials
}

/** GET /databases — backend real. Nunca trae host/loginName/password. */
export async function getMyDatabases(): Promise<DatabaseRecord[]> {
  return apiFetch<DatabaseRecord[]>('/databases')
}

/** GET /databases/{id} — a diferencia de la lista, sí trae host/port/loginName (nunca password). */
export async function getDatabaseDetail(databaseId: number): Promise<DatabaseDetail> {
  return apiFetch<DatabaseDetail>(`/databases/${databaseId}`)
}

/** POST /databases/{id}/deactivate — revoca el acceso físico, no borra datos. */
export async function deactivateDatabase(databaseId: number): Promise<DatabaseDetail> {
  return apiFetch<DatabaseDetail>(`/databases/${databaseId}/deactivate`, { method: 'POST' })
}

/** DELETE /databases/{id} — borrado físico real e irreversible. Solo si status === "Inactive". */
export async function deleteDatabase(databaseId: number): Promise<void> {
  await apiFetch<void>(`/databases/${databaseId}`, { method: 'DELETE' })
}

/**
 * POST /databases/{id}/reset-password — la contraseña nueva NUNCA viaja en la
 * respuesta (se envía por correo), a propósito, para no dejarla en el
 * historial de red del navegador ni en logs.
 */
export async function resetDatabasePassword(databaseId: number): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/databases/${databaseId}/reset-password`, { method: 'POST' })
}
