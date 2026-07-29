import { useState } from 'react'
import type { DatabaseEngine, DatabaseStatus } from '@/entities/database'
import { StatusBadge, getDatabaseStatusLabel } from '@/entities/database'
import { copyToClipboard } from '@/shared/lib/copyToClipboard'
import { downloadTextFile } from '@/shared/lib/downloadTextFile'
import styles from './DatabaseConnectionCard.module.css'

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
}

interface DatabaseConnectionCardProps {
  credentials: ConnectionInfo
  title?: string
  allowDownload?: boolean
}

interface FieldProps {
  label: string
  value: string
  wide?: boolean
}

function ConnectionField({ label, value, wide }: FieldProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await copyToClipboard(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className={`${styles.field} ${wide ? styles.fieldWide : ''}`}>
      <span className={styles.fieldLabel}>{label}</span>
      <span className={styles.fieldValueRow}>
        <span className={styles.fieldValue}>{value}</span>
        <button type="button" className={styles.iconBtn} onClick={handleCopy}>
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </span>
    </div>
  )
}

function formatCredentialsAsText(credentials: ConnectionInfo): string {
  return [
    'idempotencia — Credenciales de base de datos',
    '',
    `Host: ${credentials.host}`,
    `Puerto: ${credentials.port}`,
    `Motor: ${credentials.engine}`,
    `Base de datos: ${credentials.dbName}`,
    `Usuario: ${credentials.loginName}`,
    `Contraseña: ${credentials.password}`,
    `Estado: ${getDatabaseStatusLabel(credentials.status ?? 'Active')}`,
    ...(credentials.maxStorageMB !== undefined ? [`Espacio máximo: ${credentials.maxStorageMB} MB`] : []),
    '',
    'Guarda este archivo en un lugar seguro — la contraseña no volverá a mostrarse completa.',
  ].join('\n')
}

export function DatabaseConnectionCard({
  credentials,
  title = 'Tu base de datos está lista',
  allowDownload = true,
}: DatabaseConnectionCardProps) {
  const hasPassword = credentials.password !== undefined

  function handleDownload() {
    downloadTextFile(`${credentials.dbName}-credenciales.txt`, formatCredentialsAsText(credentials))
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        <StatusBadge status={credentials.status ?? 'Active'} />
      </div>

      {hasPassword && (
        <p className={styles.warning}>
          Guarda estas credenciales ahora — la contraseña no volverá a mostrarse completa desde el dashboard.
        </p>
      )}

      <div className={styles.fields}>
        <ConnectionField label="Host" value={credentials.host} wide />
        <ConnectionField label="Puerto" value={String(credentials.port)} />
        <ConnectionField label="Motor" value={credentials.engine} />
        <ConnectionField label="Base de datos" value={credentials.dbName} />
        <ConnectionField label="Usuario" value={credentials.loginName} />
        {hasPassword && <ConnectionField label="Contraseña" value={credentials.password as string} />}
        {credentials.maxStorageMB !== undefined && (
          <ConnectionField label="Espacio máximo" value={`${credentials.maxStorageMB} MB`} />
        )}
      </div>

      {hasPassword && allowDownload && (
        <button type="button" className={styles.downloadBtn} onClick={handleDownload}>
          Descargar credenciales (.txt)
        </button>
      )}
    </div>
  )
}
