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
  onDeleted: () => void
  onPasswordReset: (message: string) => void
}

const CONFIRM_CONTENT: Record<
  Exclude<PendingAction, null>,
  { title: string; message: string; confirmLabel: string; danger?: boolean }
> = {
  deactivate: {
    title: 'Desactivar base de datos',
    message: 'Esto desconectará tu base de datos. No hay forma de reactivarla desde aquí. ¿Quieres continuar?',
    confirmLabel: 'Desactivar',
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
  } = useManageDatabase(databaseId, { onDeactivated, onDeleted, onPasswordReset })

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

      <div className={styles.actions}>
        {status === 'Active' && (
          <Button variant="secondary" onClick={() => requestAction('deactivate')}>
            Desactivar base de datos
          </Button>
        )}
        {status === 'Active' && (
          <Button variant="ghost" onClick={() => requestAction('reset')}>
            ¿Olvidaste tu contraseña? Restablecer
          </Button>
        )}
        <div className={styles.deleteRow}>
          <Button variant="secondary" disabled={status !== 'Inactive'} onClick={() => requestAction('delete')}>
            Eliminar base de datos
          </Button>
          {status !== 'Inactive' && <p className={styles.helper}>Desactívala primero para poder eliminarla.</p>}
        </div>
      </div>

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
