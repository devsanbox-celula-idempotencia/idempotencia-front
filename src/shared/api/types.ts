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
