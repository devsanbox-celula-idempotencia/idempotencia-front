import type { AiKeyEffectiveStatus } from '../model/aiKeyStatus'
import styles from './AiKeyStatusBadge.module.css'

const LABELS: Record<AiKeyEffectiveStatus, string> = {
  active: 'Activa',
  expired: 'Expirada',
  revoked: 'Revocada',
}

export function AiKeyStatusBadge({ status }: { status: AiKeyEffectiveStatus }) {
  return (
    <span className={`${styles.badge} ${styles[status]}`}>
      <span className={styles.dot} />
      {LABELS[status]}
    </span>
  )
}
