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

/** Forma exacta que devuelven /auth/register, /auth/login y (en el futuro) el callback OAuth. */
export interface AuthResponse {
  token: string
  expiresAt: string
  userId: number
  email: string
  fullName: string
  role: Role
}

/** Hoy solo "SqlServer" responde 201; el resto devuelve 501 ("próximamente"). */
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

/** Forma de POST /databases (201) — la contraseña solo se ve esta vez, no se puede recuperar después. */
export interface DatabaseCredentials {
  databaseId: number
  engine: DatabaseEngine
  dbName: string
  status: DatabaseStatus
  maxStorageMB: number
  host: string
  port: number
  loginName: string
  password: string
}

export interface PlatformStats {
  totalUsers: number
  totalDatabases: number
  activeDatabases: number
  totalLogins: number
  activeUsers: number
  uptimePercentage: number
}
