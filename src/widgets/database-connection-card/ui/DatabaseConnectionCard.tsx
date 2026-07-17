import { useState } from 'react'
import type { DatabaseRecord } from '@/entities/database'
import { StatusBadge, DATABASE_STATUS_LABELS } from '@/entities/database'
import { copyToClipboard } from '@/shared/lib/copyToClipboard'
import { formatDate } from '@/shared/lib/formatDate'
import { downloadTextFile } from '@/shared/lib/downloadTextFile'
import styles from './DatabaseConnectionCard.module.css'

interface DatabaseConnectionCardProps {
  database: DatabaseRecord
  revealSecretsByDefault?: boolean
  allowDownload?: boolean
}

interface FieldProps {
  label: string
  value: string
  wide?: boolean
  mask?: boolean
}

function ConnectionField({ label, value, wide, mask }: FieldProps) {
  const [revealed, setRevealed] = useState(!mask)
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await copyToClipboard(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const displayValue = mask && !revealed ? '•'.repeat(Math.min(value.length, 16)) : value

  return (
    <div className={`${styles.field} ${wide ? styles.fieldWide : ''}`}>
      <span className={styles.fieldLabel}>{label}</span>
      <span className={styles.fieldValueRow}>
        <span className={styles.fieldValue}>{displayValue}</span>
        {mask && (
          <button type="button" className={styles.iconBtn} onClick={() => setRevealed((r) => !r)}>
            {revealed ? 'Ocultar' : 'Revelar'}
          </button>
        )}
        <button type="button" className={styles.iconBtn} onClick={handleCopy}>
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </span>
    </div>
  )
}

function formatCredentialsAsText(database: DatabaseRecord): string {
  return [
    'idempotencia — Credenciales de base de datos',
    `Generado: ${formatDate(new Date().toISOString())}`,
    '',
    `Host: ${database.host}`,
    `Puerto: ${database.port}`,
    `Motor: ${database.engine}`,
    `Base de datos: ${database.name}`,
    `Usuario: ${database.username}`,
    `Contraseña: ${database.password}`,
    `Estado: ${DATABASE_STATUS_LABELS[database.status]}`,
    `Fecha de creación: ${formatDate(database.createdAt)}`,
    '',
    'Guarda este archivo en un lugar seguro — la contraseña no volverá a mostrarse completa desde el dashboard.',
  ].join('\n')
}

export function DatabaseConnectionCard({
  database,
  revealSecretsByDefault = false,
  allowDownload = false,
}: DatabaseConnectionCardProps) {
  function handleDownload() {
    downloadTextFile(`${database.name}-credenciales.txt`, formatCredentialsAsText(database))
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>Conexión a tu base de datos</h3>
        <StatusBadge status={database.status} />
      </div>

      {revealSecretsByDefault && (
        <p className={styles.warning}>
          Guarda estas credenciales ahora — la contraseña no volverá a mostrarse completa por defecto.
        </p>
      )}

      <div className={styles.fields}>
        <ConnectionField label="Host" value={database.host} wide />
        <ConnectionField label="Puerto" value={String(database.port)} />
        <ConnectionField label="Motor" value={database.engine} />
        <ConnectionField label="Base de datos" value={database.name} />
        <ConnectionField label="Usuario" value={database.username} />
        <ConnectionField
          label="Contraseña"
          value={database.password}
          mask={!revealSecretsByDefault}
        />
        <ConnectionField label="Fecha de creación" value={formatDate(database.createdAt)} wide />
      </div>

      {allowDownload && (
        <button type="button" className={styles.downloadBtn} onClick={handleDownload}>
          Descargar credenciales (.txt)
        </button>
      )}
    </div>
  )
}
