import { apiFetch } from './httpClient'
import { trackDatabaseCreated } from './mock/mockStore'
import type { DatabaseCredentials, DatabaseEngine, DatabaseRecord } from './types'

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
