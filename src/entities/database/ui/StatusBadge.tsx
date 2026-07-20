import type { DatabaseStatus } from '@/shared/api'
import { getDatabaseStatusLabel } from '../model/statusLabels'
import styles from './StatusBadge.module.css'

export function StatusBadge({ status }: { status: DatabaseStatus }) {
  const cssClass = styles[status.toLowerCase()] ?? styles.unknown
  return (
    <span className={`${styles.badge} ${cssClass}`}>
      <span className={styles.dot} />
      {getDatabaseStatusLabel(status)}
    </span>
  )
}
