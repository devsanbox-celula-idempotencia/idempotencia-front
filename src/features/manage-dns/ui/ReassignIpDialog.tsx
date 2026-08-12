import { motion } from 'framer-motion'
import { Button, Input } from '@/shared/ui'
import styles from './ReassignIpDialog.module.css'

interface ReassignIpDialogProps {
  fqdn: string
  ipAddress: string
  setIpAddress: (value: string) => void
  error: string | null
  isSubmitting: boolean
  onConfirm: () => void
  onCancel: () => void
}

/** El padre debe envolver el render condicional en <AnimatePresence> para que la salida anime. */
export function ReassignIpDialog({
  fqdn,
  ipAddress,
  setIpAddress,
  error,
  isSubmitting,
  onConfirm,
  onCancel,
}: ReassignIpDialogProps) {
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
        role="dialog"
        aria-modal="true"
        aria-labelledby="reassign-ip-title"
        onClick={(event) => event.stopPropagation()}
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
      >
        <h2 id="reassign-ip-title" className={styles.title}>
          Reapuntar {fqdn}
        </h2>
        <p className={styles.message}>Lo único que se puede cambiar es la IP. Para cambiar el nombre, eliminá este subdominio y creá uno nuevo.</p>
        <Input
          label="Nueva IP pública"
          name="reassignIp"
          value={ipAddress}
          onChange={(e) => setIpAddress(e.target.value)}
          disabled={isSubmitting}
          error={error ?? undefined}
        />
        <div className={styles.actions}>
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="button" variant="primary" onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting ? 'Guardando…' : 'Reapuntar'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}
