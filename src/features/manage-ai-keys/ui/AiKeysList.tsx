import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { AiKeyStatusBadge, computeAiKeyStatus } from '@/entities/ai-key'
import type { AiApiKey } from '@/shared/api'
import { Button, ConfirmDialog } from '@/shared/ui'
import { formatDate } from '@/shared/lib/formatDate'
import { AiKeyUsagePanel } from './AiKeyUsagePanel'
import styles from './AiKeysList.module.css'

interface AiKeysListProps {
  keys: AiApiKey[]
  pendingRevokeId: number | null
  revokeError: string | null
  isRevoking: boolean
  onRequestRevoke: (id: number) => void
  onCancelRevoke: () => void
  onConfirmRevoke: () => void
}

export function AiKeysList({
  keys,
  pendingRevokeId,
  revokeError,
  isRevoking,
  onRequestRevoke,
  onCancelRevoke,
  onConfirmRevoke,
}: AiKeysListProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null)

  if (keys.length === 0) {
    return <p className={styles.empty}>Todavía no tienes ninguna API-Key. Crea la primera arriba.</p>
  }

  return (
    <div className={styles.list}>
      {keys.map((key) => (
        <div key={key.id} className={styles.row}>
          <div className={styles.rowHeader}>
            <div className={styles.rowMain}>
              <span className={styles.name}>{key.name}</span>
              <span className={styles.prefix}>{key.keyPrefix}••••••••</span>
            </div>
            <AiKeyStatusBadge status={computeAiKeyStatus(key.isActive, key.expiresAt)} />
          </div>

          <div className={styles.meta}>
            <span>
              Creada: <strong>{formatDate(key.createdAt)}</strong>
            </span>
            <span>
              Último uso: <strong>{key.lastUsedAt ? formatDate(key.lastUsedAt) : 'Nunca'}</strong>
            </span>
            {key.expiresAt && (
              <span>
                Expira: <strong>{formatDate(key.expiresAt)}</strong>
              </span>
            )}
            <span>
              Límite diario:{' '}
              <strong>{key.dailyTokenLimit === null ? 'Sin límite' : `${key.dailyTokenLimit.toLocaleString('es-CO')} tokens`}</strong>
            </span>
          </div>

          <div className={styles.actions}>
            <Button
              variant="ghost"
              onClick={() => setExpandedId((current) => (current === key.id ? null : key.id))}
            >
              {expandedId === key.id ? 'Ocultar consumo' : 'Ver consumo'}
            </Button>
            {key.isActive && (
              <Button variant="secondary" className={styles.revokeBtn} onClick={() => onRequestRevoke(key.id)}>
                Revocar
              </Button>
            )}
          </div>

          {expandedId === key.id && <AiKeyUsagePanel apiKeyId={key.id} />}
        </div>
      ))}

      <AnimatePresence>
        {pendingRevokeId !== null && (
          <ConfirmDialog
            key="revoke-ai-key-confirm"
            title="Revocar API-Key"
            message="Esto revoca la clave de inmediato — cualquier integración que la use dejará de funcionar. No borra el historial de uso."
            confirmLabel="Revocar"
            isSubmitting={isRevoking}
            errorMessage={revokeError}
            onConfirm={onConfirmRevoke}
            onCancel={onCancelRevoke}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
