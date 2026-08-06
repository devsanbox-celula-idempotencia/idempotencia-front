import type { DatabaseEngine, DatabaseStatus } from '@/entities/database'
import { StatusBadge } from '@/entities/database'
import { CredentialRevealCard, type CredentialField } from '@/shared/ui'

/**
 * Estructural, no importa `DatabaseCredentials`/`DatabaseDetail` directo:
 * ambos shapes calzan acá (la única diferencia real es que `DatabaseDetail`
 * nunca trae `password` — el backend no la vuelve a dar tras la creación).
 */
interface ConnectionInfo {
  databaseId: number
  engine: DatabaseEngine
  dbName: string
  status?: DatabaseStatus
  maxStorageMB?: number
  host: string
  port: number
  loginName: string
  password?: string
  /** Trae la contraseña embebida — igual de sensible, solo viene junto con `password`. */
  connectionUri?: string
  /** `null` en Mongo (no aplica) — la fila se oculta en ese caso, nunca se muestra "null". */
  jdbcUrl?: string | null
}

interface DatabaseConnectionCardProps {
  credentials: ConnectionInfo
  title?: string
  allowDownload?: boolean
}

export function DatabaseConnectionCard({
  credentials,
  title = 'Tu base de datos está lista',
  allowDownload = true,
}: DatabaseConnectionCardProps) {
  const hasPassword = credentials.password !== undefined

  const fields: CredentialField[] = [
    { label: 'Host', value: credentials.host, wide: true },
    { label: 'Puerto', value: String(credentials.port) },
    { label: 'Motor', value: credentials.engine },
    { label: 'Base de datos', value: credentials.dbName },
    { label: 'Usuario', value: credentials.loginName },
    ...(hasPassword ? [{ label: 'Contraseña', value: credentials.password as string }] : []),
    ...(credentials.connectionUri ? [{ label: 'Connection URI', value: credentials.connectionUri, wide: true }] : []),
    ...(credentials.jdbcUrl ? [{ label: 'JDBC URL', value: credentials.jdbcUrl, wide: true }] : []),
    ...(credentials.maxStorageMB !== undefined
      ? [{ label: 'Espacio máximo', value: `${credentials.maxStorageMB} MB` }]
      : []),
  ]

  return (
    <CredentialRevealCard
      title={title}
      badge={<StatusBadge status={credentials.status ?? 'Active'} />}
      warningMessage={
        hasPassword
          ? 'Guarda estas credenciales ahora — la contraseña no volverá a mostrarse completa desde el dashboard.'
          : undefined
      }
      fields={fields}
      downloadFileName={hasPassword && allowDownload ? `${credentials.dbName}-credenciales.txt` : undefined}
      downloadHeading="idempotencia — Credenciales de base de datos"
      downloadNote="Guarda este archivo en un lugar seguro — la contraseña no volverá a mostrarse completa."
    />
  )
}
