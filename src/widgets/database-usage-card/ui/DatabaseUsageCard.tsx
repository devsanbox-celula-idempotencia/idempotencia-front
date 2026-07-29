import type { DatabaseRecord } from '@/entities/database'
import { StatusBadge } from '@/entities/database'
import { formatDate } from '@/shared/lib/formatDate'
import styles from './DatabaseUsageCard.module.css'

function meterSeverityClass(percentUsed: number): string {
  if (percentUsed >= 90) return styles.meterDanger
  if (percentUsed >= 70) return styles.meterWarning
  return styles.meterOk
}

export function DatabaseUsageCard({ database }: { database: DatabaseRecord }) {
  const percentUsed = Math.min(100, Math.round((database.currentSizeMB / database.maxStorageMB) * 100))

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>{database.dbName}</h3>
          <p className={styles.engine}>{database.engine}</p>
        </div>
        <StatusBadge status={database.status} />
      </div>

      <div>
        <div className={styles.meterTrack}>
          <div
            className={`${styles.meterFill} ${meterSeverityClass(percentUsed)}`}
            style={{ width: `${percentUsed}%` }}
          />
        </div>
        <p className={styles.meterCaption}>
          <span>
            <strong>{database.currentSizeMB} MB</strong> usados de <strong>{database.maxStorageMB} MB</strong>
          </span>
          <span>{percentUsed}%</span>
        </p>
      </div>

      <div className={styles.metaRow}>
        <span>
          Creada: <strong>{formatDate(database.createdAt)}</strong>
        </span>
        <span>
          Última actividad: <strong>{formatDate(database.lastActivityAt)}</strong>
        </span>
      </div>
    </div>
  )
}
