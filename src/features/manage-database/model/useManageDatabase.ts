import { useEffect, useState } from 'react'
import { ApiError, databaseApi } from '@/shared/api'
import type { DatabaseDetail } from '@/entities/database'

export type PendingAction = 'deactivate' | 'delete' | 'reset' | 'reactivate' | null

interface ManageDatabaseCallbacks {
  onDeactivated: () => void
  onDeleted: () => void
  onPasswordReset: (message: string) => void
}

function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : 'Ocurrió un error inesperado. Intenta de nuevo.'
}

export function useManageDatabase(databaseId: number, callbacks: ManageDatabaseCallbacks) {
  const [detail, setDetail] = useState<DatabaseDetail | null>(null)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(true)

  const [pendingAction, setPendingAction] = useState<PendingAction>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [isSubmittingAction, setIsSubmittingAction] = useState(false)

  function loadDetail() {
    setLoadingDetail(true)
    setDetailError(null)
    databaseApi
      .getDatabaseDetail(databaseId)
      .then((result) => setDetail(result))
      .catch((error) => setDetailError(errorMessage(error)))
      .finally(() => setLoadingDetail(false))
  }

  useEffect(() => {
    setDetail(null)
    loadDetail()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [databaseId])

  function requestAction(action: Exclude<PendingAction, null>) {
    setActionError(null)
    setPendingAction(action)
  }

  function cancelPendingAction() {
    if (isSubmittingAction) return
    setPendingAction(null)
    setActionError(null)
  }

  async function confirmPendingAction() {
    if (!pendingAction) return
    setIsSubmittingAction(true)
    setActionError(null)
    try {
      if (pendingAction === 'deactivate') {
        const result = await databaseApi.deactivateDatabase(databaseId)
        setDetail(result)
        setPendingAction(null)
        callbacks.onDeactivated()
      } else if (pendingAction === 'delete') {
        await databaseApi.deleteDatabase(databaseId)
        setPendingAction(null)
        callbacks.onDeleted()
      } else if (pendingAction === 'reset') {
        const result = await databaseApi.resetDatabasePassword(databaseId)
        setPendingAction(null)
        callbacks.onPasswordReset(result.message)
      } else {
        // 'reactivate': backend todavía no comparte el endpoint (solo existen
        // deactivate/delete/reset-password hoy). El botón y todo el flujo de
        // confirmación ya quedan armados — cuando llegue la ruta real, este
        // `throw` se reemplaza por un `await databaseApi.reactivateDatabase(...)`
        // igual que los otros tres casos, sin tocar nada más.
        throw new ApiError(
          501,
          'Esta función todavía no está disponible: el backend no ha compartido el endpoint para reactivar bases de datos.',
        )
      }
    } catch (error) {
      setActionError(errorMessage(error))
    } finally {
      setIsSubmittingAction(false)
    }
  }

  return {
    detail,
    detailError,
    loadingDetail,
    reloadDetail: loadDetail,
    pendingAction,
    actionError,
    isSubmittingAction,
    requestAction,
    cancelPendingAction,
    confirmPendingAction,
  }
}
