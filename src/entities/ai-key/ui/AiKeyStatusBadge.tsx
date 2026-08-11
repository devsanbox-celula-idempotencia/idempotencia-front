import styles from './AiKeyStatusBadge.module.css'

export function AiKeyStatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span className={`${styles.badge} ${isActive ? styles.active : styles.revoked}`}>
      <span className={styles.dot} />
      {isActive ? 'Activa' : 'Revocada'}
    </span>
  )
}
