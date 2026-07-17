import { delay } from './mock/delay'
import { getDatabasesForUser, provisionDatabaseFor } from './mock/mockStore'
import type { DatabaseRecord } from './types'

export async function provisionDatabase(userId: string): Promise<DatabaseRecord> {
  await delay(1200)
  return provisionDatabaseFor(userId)
}

/** Un usuario puede tener varias bases de datos — usado por el dashboard. */
export async function getMyDatabases(userId: string): Promise<DatabaseRecord[]> {
  await delay(400)
  return getDatabasesForUser(userId)
}

/** Conveniencia para flujos que solo necesitan "la que acabo de crear" (ej. Welcome). */
export async function getMyDatabase(userId: string): Promise<DatabaseRecord | null> {
  const databases = await getMyDatabases(userId)
  return databases[0] ?? null
}
