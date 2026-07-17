import { useState } from 'react'
import type { DatabaseCredentials } from '@/entities/database'
import { StatusBadge, getDatabaseStatusLabel } from '@/entities/database'
import { copyToClipboard } from '@/shared/lib/copyToClipboard'
import { downloadTextFile } from '@/shared/lib/downloadTextFile'
import styles from './DatabaseConnectionCard.module.css'

interface DatabaseConnectionCardProps {
  credentials: DatabaseCredentials
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

function formatCredentialsAsText(credentials: DatabaseCredentials): string {
  return [
    'idempotencia — Credenciales de base de datos',
    '',
    `Host: ${credentials.host}`,
    `Puerto: ${credentials.port}`,
    `Motor: ${credentials.engine}`,
    `Base de datos: ${credentials.dbName}`,
    `Usuario: ${credentials.loginName}`,
    `Contraseña: ${credentials.password}`,
    `Estado: ${getDatabaseStatusLabel(credentials.status)}`,
    `Espacio máximo: ${credentials.maxStorageMB} MB`,
    '',
    'Guarda este archivo en un lugar seguro — la contraseña no volverá a mostrarse completa.',
  ].join('\n')
}

export function DatabaseConnectionCard({ credentials, allowDownload = true }: DatabaseConnectionCardProps) {
  function handleDownload() {
    downloadTextFile(`${credentials.dbName}-credenciales.txt`, formatCredentialsAsText(credentials))
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>Tu base de datos está lista</h3>
        <StatusBadge status={credentials.status} />
      </div>

      <p className={styles.warning}>
        Guarda estas credenciales ahora — la contraseña no volverá a mostrarse completa desde el dashboard.
      </p>

      <div className={styles.fields}>
        <ConnectionField label="Host" value={credentials.host} wide />
        <ConnectionField label="Puerto" value={String(credentials.port)} />
        <ConnectionField label="Motor" value={credentials.engine} />
        <ConnectionField label="Base de datos" value={credentials.dbName} />
        <ConnectionField label="Usuario" value={credentials.loginName} />
        <ConnectionField label="Contraseña" value={credentials.password} />
        <ConnectionField label="Espacio máximo" value={`${credentials.maxStorageMB} MB`} />
      </div>

      {allowDownload && (
        <button type="button" className={styles.downloadBtn} onClick={handleDownload}>
          Descargar credenciales (.txt)
        </button>
      )}
    </div>
  )
}
