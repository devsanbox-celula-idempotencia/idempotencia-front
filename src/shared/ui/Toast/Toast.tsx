import { useEffect } from 'react'
import { motion } from 'framer-motion'
import styles from './Toast.module.css'

interface ToastProps {
  message: string
  onDismiss: () => void
  durationMs?: number
}

/** El padre debe envolver el render condicional en <AnimatePresence> para que la salida anime. */
export function Toast({ message, onDismiss, durationMs = 4000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, durationMs)
    return () => clearTimeout(timer)
  }, [onDismiss, durationMs])

  return (
    <motion.div
      className={styles.toast}
      role="status"
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
    >
      <span className={styles.dot} />
      <span className={styles.message}>{message}</span>
      <button type="button" className={styles.closeBtn} onClick={onDismiss} aria-label="Cerrar notificación">
        ×
      </button>
    </motion.div>
  )
}
