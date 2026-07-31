import { motion } from 'framer-motion'
import type { DatabaseStatus } from '@/shared/api'
import { getDatabaseStatusLabel } from '../model/statusLabels'
import styles from './StatusBadge.module.css'

export function StatusBadge({ status }: { status: DatabaseStatus }) {
  const cssClass = styles[status.toLowerCase()] ?? styles.unknown
  const isActive = status === 'Active'

  return (
    <span className={`${styles.badge} ${cssClass}`}>
      {isActive ? (
        <motion.span
          className={styles.dot}
          animate={{ opacity: [1, 0.35, 1], scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      ) : (
        <span className={styles.dot} />
      )}
      {getDatabaseStatusLabel(status)}
    </span>
  )
}
