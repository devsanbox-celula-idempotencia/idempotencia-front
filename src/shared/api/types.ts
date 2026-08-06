/**
 * Contratos de datos compartidos entre frontend y backend.
 *
 * `AuthProviderName`, `AuthResponse`, `Role` y todo lo relacionado con
 * `Database*` reflejan el contrato REAL del backend ("API Colmena — Guía de
 * consumo" y la guía de endpoints de `/databases`). Solo `PlatformStats`
 * sigue sin backend — lo produce `shared/api/mock/*` con la forma que se
 * espera que tenga cuando exista.
 */

export type AuthProviderName = 'google' | 'github'

export type Role = 'Admin' | 'Student' | 'Developer'

/** Los 4 motores tienen provisioner real en el backend. */
export type DatabaseEngine = 'SqlServer' | 'Postgres' | 'MySql' | 'Mongo'

// `(string & {})` deja pasar cualquier valor que el backend agregue a futuro
// sin romper el tipado, conservando el autocompletado de los conocidos.
export type DatabaseStatus = 'Active' | 'Provisioning' | 'Paused' | 'Error' | (string & {})

/** Forma de GET /databases — nunca trae credenciales, solo el POST de creación las devuelve. */
export interface DatabaseRecord {
  databaseId: number
  engine: DatabaseEngine
  dbName: string
  status: DatabaseStatus
  maxStorageMB: number
  currentSizeMB: number
  lastActivityAt: string
  createdAt: string
  pausedAt: string | null
}

/**
 * Forma de POST /databases (201) y de `AuthResponse.mySqlDatabase` — la
 * contraseña solo se ve esta vez, no se puede recuperar después.
 * `status`/`maxStorageMB` son opcionales porque `mySqlDatabase` (aprovisionado
 * automático en el primer login/registro por contraseña) no los incluye.
 *
 * `connectionUri` trae la contraseña embebida — es tan sensible como
 * `password` (no loguear, no persistir, no mandar a analytics). `jdbcUrl`
 * viene `null` en Mongo (no aplica) — ocultar esa fila en vez de mostrar
 * "null". Ninguno de los dos vuelve en `GET /databases/{id}` a propósito
 * (ver `DatabaseDetail`): si se pierden, la única vía es reset-password.
 */
export interface DatabaseCredentials {
  databaseId: number
  engine: DatabaseEngine
  dbName: string
  status?: DatabaseStatus
  maxStorageMB?: number
  host: string
  port: number
  loginName: string
  password: string
  connectionUri: string
  jdbcUrl: string | null
}

/**
 * Forma de GET /databases/{id} (y de la respuesta de deactivate) — a
 * diferencia de la lista, sí trae host/port/loginName (todo menos la
 * contraseña, que nunca vuelve; para eso existe reset-password).
 */
export interface DatabaseDetail {
  databaseId: number
  engine: DatabaseEngine
  dbName: string
  status: DatabaseStatus
  host: string
  port: number
  loginName: string
  maxStorageMB: number
  currentSizeMB: number
  lastActivityAt: string
  createdAt: string
  pausedAt: string | null
  deletedAt: string | null
}

/** Forma exacta que devuelven /auth/register, /auth/login y (en el futuro) el callback OAuth. */
export interface AuthResponse {
  token: string
  expiresAt: string
  userId: number
  email: string
  fullName: string
  role: Role
  /**
   * Poblado SOLO la primera vez que un usuario se registra o inicia sesión
   * por contraseña — el backend aprovisiona su BD MySQL automáticamente ahí.
   * En logins posteriores (o si el aprovisionamiento falla) viene `null`.
   * No aplica a OAuth (ver `authApi` / `pages/oauth-callback`).
   */
  mySqlDatabase: DatabaseCredentials | null
}

export interface PlatformStats {
  totalUsers: number
  totalDatabases: number
  activeDatabases: number
  totalLogins: number
  activeUsers: number
  uptimePercentage: number
}

/**
 * IA como servicio (entregable 3): `idempotencia-back` hace de BFF frente al
 * gateway interno (FastAPI sobre Ollama, compatible con la API de OpenAI) —
 * el `X-Admin-Token` del gateway nunca sale del backend. El contrato acá
 * abajo es el que backend confirmó que van a exponer bajo `/ai/api-keys`,
 * todavía sin desplegar al momento de escribir esto (mismo patrón que el
 * ciclo de vida de bases de datos: se construye contra el contrato, el 500
 * hasta que desplieguen queda documentado, no bloquea el frontend).
 */
export interface AiApiKey {
  id: number
  userId: number
  name: string
  /** Primeros 12 caracteres (`sk_live_` + 4) — se muestra como `sk_live_Yh2K••••••••`. */
  keyPrefix: string
  /** Revocar es soft-delete (no borra la fila) — el listado trae activas Y revocadas. */
  isActive: boolean
  createdAt: string
  lastUsedAt: string | null
  expiresAt: string | null
  dailyTokenLimit: number
  requestsPerMinute: number
}

/** Forma de POST /ai/api-keys (201) — `apiKey` completa solo se ve esta vez. */
export interface AiApiKeyCredentials {
  id: number
  name: string
  apiKey: string
  createdAt: string
}

export interface AiUsageDay {
  day: string
  requests: number
  promptTokens: number
  completionTokens: number
  totalTokens: number
}

/** Forma de GET /ai/api-keys/{id}/usage?start=&end= — el rango es obligatorio en el gateway. */
export interface AiUsageSummary {
  apiKeyId: number
  totalRequests: number
  promptTokens: number
  completionTokens: number
  totalTokens: number
  days: AiUsageDay[]
}
