/**
 * Contratos de datos compartidos entre frontend y backend.
 *
 * `AuthProviderName`, `AuthResponse` y `Role` reflejan el contrato REAL del
 * backend de autenticación (ver "API Colmena — Guía de consumo"). El resto
 * (`DatabaseRecord`, `PlatformStats`) todavía no tiene backend — los produce
 * `shared/api/mock/*` con la forma que se espera que tenga cuando exista.
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

export type DatabaseStatus = 'provisioning' | 'active' | 'suspended' | 'error'

export interface DatabaseRecord {
  id: string
  ownerId: string
  host: string
  port: number
  name: string
  username: string
  password: string
  engine: string
  status: DatabaseStatus
  createdAt: string
  spaceUsedMb: number
  spaceMaxMb: number
  lastActivityAt: string
}

export interface PlatformStats {
  totalUsers: number
  totalDatabases: number
  activeDatabases: number
  totalLogins: number
  activeUsers: number
  uptimePercentage: number
}
