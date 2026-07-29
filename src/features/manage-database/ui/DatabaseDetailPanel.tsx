import type { DatabaseRecord } from '@/entities/database'
import { DatabaseConnectionCard } from '@/widgets/database-connection-card'
import { DatabaseUsageCard } from '@/widgets/database-usage-card'
import { Button, ConfirmDialog } from '@/shared/ui'
import { useManageDatabase, type PendingAction } from '../model/useManageDatabase'
import styles from './DatabaseDetailPanel.module.css'

interface DatabaseDetailPanelProps {
  databaseId: number
  listRecord: DatabaseRecord
  onDeactivated: () => void
  onReactivated: () => void
  onDeleted: () => void
  onPasswordReset: (message: string) => void
}

const CONFIRM_CONTENT: Record<
  Exclude<PendingAction, null>,
  { title: string; message: string; confirmLabel: string; danger?: boolean }
> = {
  // Tono ligero a propósito: desactivar es un toggle reversible (pausar/
  // reanudar), no una acción destructiva — el backend pidió reservar el
  // modal "fuerte" solo para eliminar, que sí es irreversible.
  deactivate: {
    title: 'Pausar base de datos',
    message: 'Tu base de datos dejará de aceptar conexiones. Puedes reactivarla cuando quieras y no perderás datos.',
    confirmLabel: 'Desactivar',
  },
  reactivate: {
    title: 'Reactivar base de datos',
    message: 'Esto vuelve a dejar tu base de datos disponible para conectarte. ¿Quieres continuar?',
    confirmLabel: 'Reactivar',
  },
  delete: {
    title: 'Eliminar base de datos',
    message: 'Esto borra la base de datos de forma permanente e irreversible. ¿Quieres continuar?',
    confirmLabel: 'Eliminar',
    danger: true,
  },
  reset: {
    title: 'Restablecer contraseña',
    message:
      'Se generará una contraseña nueva y se enviará a tu correo. La contraseña actual dejará de funcionar. ¿Continuar?',
    confirmLabel: 'Restablecer',
  },
}

export function DatabaseDetailPanel({
  databaseId,
  listRecord,
  onDeactivated,
  onReactivated,
  onDeleted,
  onPasswordReset,
}: DatabaseDetailPanelProps) {
  const {
    detail,
    detailError,
    loadingDetail,
    reloadDetail,
    pendingAction,
    actionError,
    isSubmittingAction,
    requestAction,
    cancelPendingAction,
    confirmPendingAction,
  } = useManageDatabase(databaseId, { onDeactivated, onReactivated, onDeleted, onPasswordReset })

  const status = detail?.status ?? listRecord.status

  return (
    <div className={styles.panel}>
      {loadingDetail && <p className={styles.loading}>Cargando datos de conexión…</p>}

      {!loadingDetail && detailError && (
        <div className={styles.connectionError}>
          <p>No pudimos cargar los datos de conexión: {detailError}</p>
          <Button variant="secondary" onClick={reloadDetail}>
            Reintentar
          </Button>
        </div>
      )}

      {!loadingDetail && detail && (
        <DatabaseConnectionCard credentials={detail} title="Datos de conexión" allowDownload={false} />
      )}

      <DatabaseUsageCard database={listRecord} />

      {status !== 'Deleted' && (
        <div className={styles.actions}>
          <div className={styles.dangerZone}>
            {status === 'Active' && (
              <Button
                variant="secondary"
                className={styles.deactivateBtn}
                onClick={() => requestAction('deactivate')}
              >
                Desactivar base de datos
              </Button>
            )}
            {status === 'Inactive' && (
              <Button
                variant="secondary"
                className={styles.reactivateBtn}
                onClick={() => requestAction('reactivate')}
              >
                Reactivar base de datos
              </Button>
            )}
            <div className={styles.deleteRow}>
              <Button
                variant="secondary"
                className={status === 'Inactive' ? styles.deleteBtn : undefined}
                disabled={status !== 'Inactive'}
                onClick={() => requestAction('delete')}
              >
                Eliminar base de datos
              </Button>
              {status !== 'Inactive' && <p className={styles.helper}>Desactívala primero para poder eliminarla.</p>}
            </div>
          </div>
          {status === 'Active' && (
            <Button variant="ghost" onClick={() => requestAction('reset')}>
              ¿Olvidaste tu contraseña? Restablecer
            </Button>
          )}
        </div>
      )}

      {pendingAction && (
        <ConfirmDialog
          {...CONFIRM_CONTENT[pendingAction]}
          isSubmitting={isSubmittingAction}
          errorMessage={actionError}
          onConfirm={confirmPendingAction}
          onCancel={cancelPendingAction}
        />
      )}
    </div>
  )
}
