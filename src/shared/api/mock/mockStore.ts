import type { AuthProviderName, AuthResponse, DatabaseRecord, PlatformStats, Role } from '../types'

/**
 * "Backend" falso persistido en localStorage — cubre lo que el backend real
 * todavía no expone: aprovisionamiento de base de datos y métricas de
 * plataforma. La autenticación real (password) SÍ pega contra el backend
 * (ver authApi.ts), pero también reporta actividad aquí (`trackAuthActivity`)
 * para que las métricas de la landing reflejen toda la actividad de este
 * navegador, sin importar si vino de password real o de OAuth simulado.
 */

const STORAGE_KEY = 'idempotencia:mock-backend:v1'
const UPTIME_PERCENTAGE = 99.95

interface MockUserRecord {
  userId: number
  email: string
  fullName: string
  role: Role
  createdAt: string
  lastLoginAt: string
}

interface MockState {
  users: MockUserRecord[]
  /** Mapea proveedor -> userId asignado, para que el OAuth simulado reutilice la misma identidad en este navegador (no duplica usuarios). */
  providerIdentities: Partial<Record<AuthProviderName, number>>
  totalLogins: number
  nextUserId: number
  databases: DatabaseRecord[]
}

function emptyState(): MockState {
  return { users: [], providerIdentities: {}, totalLogins: 0, nextUserId: 1, databases: [] }
}

function readState(): MockState {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return emptyState()
  try {
    return { ...emptyState(), ...(JSON.parse(raw) as MockState) }
  } catch {
    return emptyState()
  }
}

function writeState(state: MockState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function toAuthResponse(record: MockUserRecord): AuthResponse {
  return {
    token: `mock-${crypto.randomUUID()}`,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    userId: record.userId,
    email: record.email,
    fullName: record.fullName,
    role: record.role,
  }
}

const PROVIDER_PROFILES: Record<AuthProviderName, { name: string; emailDomain: string }> = {
  google: { name: 'Ana Martínez', emailDomain: 'gmail.com' },
  github: { name: 'Carlos Ríos', emailDomain: 'users.noreply.github.com' },
}

/** OAuth simulado: misma identidad falsa por proveedor en este navegador. */
export function findOrCreateOAuthIdentity(
  provider: AuthProviderName,
): { authResponse: AuthResponse; isNewUser: boolean } {
  const state = readState()
  const now = new Date().toISOString()

  const existingUserId = state.providerIdentities[provider]
  const existingRecord = state.users.find((u) => u.userId === existingUserId)
  if (existingRecord) {
    existingRecord.lastLoginAt = now
    state.totalLogins += 1
    writeState(state)
    return { authResponse: toAuthResponse(existingRecord), isNewUser: false }
  }

  const profile = PROVIDER_PROFILES[provider]
  const userId = state.nextUserId
  state.nextUserId += 1

  const record: MockUserRecord = {
    userId,
    email: `${profile.name.toLowerCase().replace(/\s+/g, '.')}@${profile.emailDomain}`,
    fullName: profile.name,
    role: 'Student',
    createdAt: now,
    lastLoginAt: now,
  }
  state.users.push(record)
  state.providerIdentities[provider] = userId
  state.totalLogins += 1
  writeState(state)
  return { authResponse: toAuthResponse(record), isNewUser: true }
}

/** Auth real (password): registra actividad local para que las métricas de la landing la reflejen. */
export function trackAuthActivity(authResponse: AuthResponse): void {
  const state = readState()
  const now = new Date().toISOString()

  const existing = state.users.find((u) => u.userId === authResponse.userId)
  if (existing) {
    existing.lastLoginAt = now
  } else {
    state.users.push({
      userId: authResponse.userId,
      email: authResponse.email,
      fullName: authResponse.fullName,
      role: authResponse.role,
      createdAt: now,
      lastLoginAt: now,
    })
  }
  state.totalLogins += 1
  writeState(state)
}

function randomPassword(): string {
  return crypto
    .randomUUID()
    .replace(/-/g, '')
    .slice(0, 16)
}

export function provisionDatabaseFor(userId: string): DatabaseRecord {
  const state = readState()
  const existing = state.databases.find((d) => d.ownerId === userId)
  if (existing) return existing

  const now = new Date().toISOString()
  const slug = userId.padStart(6, '0')
  const database: DatabaseRecord = {
    id: crypto.randomUUID(),
    ownerId: userId,
    host: `db-${slug}.idempotencia.andrescortes.dev`,
    port: 3306,
    name: `idm_${slug}`,
    username: `idm_${slug}`,
    password: randomPassword(),
    engine: 'MySQL 8.0',
    status: 'active',
    createdAt: now,
    spaceUsedMb: 4,
    spaceMaxMb: 20,
    lastActivityAt: now,
  }
  state.databases.push(database)
  writeState(state)
  return database
}

export function getDatabasesForUser(userId: string): DatabaseRecord[] {
  const state = readState()
  return state.databases.filter((d) => d.ownerId === userId)
}

const ACTIVE_WINDOW_MS = 1000 * 60 * 60 * 24 * 7 // 7 días

export function computePlatformStats(): PlatformStats {
  const state = readState()
  const now = Date.now()

  const activeDatabases = state.databases.filter((d) => d.status === 'active').length
  const activeUsers = state.users.filter(
    (u) => now - new Date(u.lastLoginAt).getTime() <= ACTIVE_WINDOW_MS,
  ).length

  return {
    totalUsers: state.users.length,
    totalDatabases: state.databases.length,
    activeDatabases,
    totalLogins: state.totalLogins,
    activeUsers,
    uptimePercentage: UPTIME_PERCENTAGE,
  }
}

export function resetMockData(): void {
  localStorage.removeItem(STORAGE_KEY)
}
