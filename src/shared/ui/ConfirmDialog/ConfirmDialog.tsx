import { motion } from 'framer-motion'
import { Button } from '../Button/Button'
import styles from './ConfirmDialog.module.css'

interface ConfirmDialogProps {
  title: string
  message: string
  confirmLabel: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  isSubmitting?: boolean
  danger?: boolean
  errorMessage?: string | null
}

/** El padre debe envolver el render condicional en <AnimatePresence> para que la salida anime. */
export function ConfirmDialog({
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  isSubmitting = false,
  danger = false,
  errorMessage,
}: ConfirmDialogProps) {
  return (
    <motion.div
      className={styles.overlay}
      role="presentation"
      onClick={onCancel}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className={styles.dialog}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        onClick={(event) => event.stopPropagation()}
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
      >
        <h2 id="confirm-dialog-title" className={styles.title}>
          {title}
        </h2>
        <p className={styles.message}>{message}</p>
        {errorMessage && <p className={styles.error}>{errorMessage}</p>}
        <div className={styles.actions}>
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={danger ? 'primary' : 'secondary'}
            className={danger ? styles.dangerBtn : undefined}
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Procesando…' : confirmLabel}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}
