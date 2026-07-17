import type { DatabaseStatus } from '@/shared/api'
import { DATABASE_STATUS_LABELS } from '../model/statusLabels'
import styles from './StatusBadge.module.css'

export function StatusBadge({ status }: { status: DatabaseStatus }) {
  return (
    <span className={`${styles.badge} ${styles[status]}`}>
      <span className={styles.dot} />
      {DATABASE_STATUS_LABELS[status]}
    </span>
  )
}
