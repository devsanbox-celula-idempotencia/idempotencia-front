import { useEffect } from 'react'
import styles from './Toast.module.css'

interface ToastProps {
  message: string
  onDismiss: () => void
  durationMs?: number
}

export function Toast({ message, onDismiss, durationMs = 4000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, durationMs)
    return () => clearTimeout(timer)
  }, [onDismiss, durationMs])

  return (
    <div className={styles.toast} role="status">
      <span className={styles.dot} />
      <span className={styles.message}>{message}</span>
      <button type="button" className={styles.closeBtn} onClick={onDismiss} aria-label="Cerrar notificación">
        ×
      </button>
    </div>
  )
}
