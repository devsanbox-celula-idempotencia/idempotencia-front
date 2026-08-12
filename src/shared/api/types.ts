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
 * IA como servicio: **no** pasa por `idempotencia-back` — es un backend
 * aparte (el gateway, FastAPI sobre Ollama, compatible con la API de
 * OpenAI), que valida el JWT de la plataforma por su cuenta y expone
 * `/me/api-keys`. Mismo `Authorization: Bearer` de siempre, otra base URL
 * (`VITE_AI_GATEWAY_BASE_URL`). El gateway manda `snake_case` y fechas UTC
 * sin sufijo `Z` — `shared/api/aiApi.ts` normaliza ambas cosas al mapear la
 * respuesta a estos tipos, así el resto de la app no tiene que pensarlo.
 */
export interface AiApiKey {
  id: number
  name: string
  /** Primeros 12 caracteres (`sk_live_` + 4) — se muestra como `sk_live_Yh2K••••••••`. */
  keyPrefix: string
  /** Revocar es soft-delete (no borra la fila) — el listado trae activas Y revocadas. */
  isActive: boolean
  createdAt: string
  lastUsedAt: string | null
  /** Una key puede seguir `isActive: true` y ya no servir si esto pasó — ver `computeAiKeyStatus`. */
  expiresAt: string | null
  dailyTokenLimit: number | null
  requestsPerMinute: number | null
}

/** Forma de POST /me/api-keys (201) — `apiKey` completa solo se ve esta vez, no persistir. */
export interface AiApiKeyCredentials {
  id: number
  name: string
  apiKey: string
  createdAt: string
  /** Vienen del gateway a propósito: si el despliegue cambia de host o de modelo, no hay que tocar el front. */
  baseUrl: string
  model: string
}

export interface AiUsageDay {
  day: string
  requests: number
  promptTokens: number
  completionTokens: number
  totalTokens: number
}

/** Forma de GET /me/api-keys/{id}/usage?start=&end= — sin fechas, el gateway asume los últimos 30 días. */
export interface AiUsageSummary {
  apiKeyId: number | null
  totalRequests: number
  promptTokens: number
  completionTokens: number
  totalTokens: number
  days: AiUsageDay[]
}

/**
 * Subdominios DNS: es del backend principal (`idempotencia-back`, mismo JWT
 * de siempre), no del gateway de IA. En la práctica el frontend solo ve
 * `status: 'Active'` — `Provisioning`/`Failed` son transitorios que no
 * llegan a una respuesta exitosa, y los eliminados/revocados no aparecen en
 * el listado del usuario. El tipo queda abierto por si backend agrega un
 * estado nuevo sin avisar (mismo patrón que `DatabaseStatus`).
 */
export interface DnsRecord {
  dnsRecordId: number
  label: string
  cell: string
  fqdn: string
  recordType: 'A'
  ipAddress: string
  proxied: boolean
  ttl: number
  status: 'Provisioning' | 'Active' | 'Failed' | 'Deleted' | 'Revoked' | (string & {})
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

/** Forma de GET /dns/zone — nunca hardcodear el dominio, cambia entre ambientes. */
export interface DnsZone {
  zoneName: string
  defaultCell: string
  /** Ej. "{label}.idempotencia.coderhivex.com" — reemplazar "{label}" para la vista previa en vivo. */
  pattern: string
}

/** Forma de POST /dns — `cell` no se manda hoy, el backend usa "idempotencia" por defecto. */
export interface CreateDnsRecordRequest {
  label: string
  ipAddress: string
}
