import type { AuthProviderName, AuthResponse, PlatformStats, Role } from '../types'

/**
 * "Backend" falso persistido en localStorage — cubre lo que el backend real
 * todavía no expone: métricas de plataforma para la landing. La autenticación
 * real (password) y la creación de bases de datos SÍ pegan contra el backend
 * (ver authApi.ts / databaseApi.ts), pero también reportan actividad aquí
 * (`trackAuthActivity`, `trackDatabaseCreated`) para que las métricas de la
 * landing reflejen la actividad de este navegador sin depender de guardar
 * los registros completos (las credenciales reales nunca pasan por aquí).
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
  databaseStats: { total: number; active: number }
}

function emptyState(): MockState {
  return {
    users: [],
    providerIdentities: {},
    totalLogins: 0,
    nextUserId: 1,
    databaseStats: { total: 0, active: 0 },
  }
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
    mySqlDatabase: null,
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

/** Se llama tras un POST /databases exitoso, para que la landing refleje la actividad de este navegador. */
export function trackDatabaseCreated(isActive: boolean): void {
  const state = readState()
  state.databaseStats.total += 1
  if (isActive) state.databaseStats.active += 1
  writeState(state)
}

const ACTIVE_WINDOW_MS = 1000 * 60 * 60 * 24 * 7 // 7 días

export function computePlatformStats(): PlatformStats {
  const state = readState()
  const now = Date.now()

  const activeUsers = state.users.filter(
    (u) => now - new Date(u.lastLoginAt).getTime() <= ACTIVE_WINDOW_MS,
  ).length

  return {
    totalUsers: state.users.length,
    totalDatabases: state.databaseStats.total,
    activeDatabases: state.databaseStats.active,
    totalLogins: state.totalLogins,
    activeUsers,
    uptimePercentage: UPTIME_PERCENTAGE,
  }
}

export function resetMockData(): void {
  localStorage.removeItem(STORAGE_KEY)
}
