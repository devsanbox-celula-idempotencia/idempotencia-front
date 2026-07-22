import { useEffect, useState } from 'react'
import { SiteHeader } from '@/widgets/site-header'
import { DatabaseSidebar } from '@/widgets/database-sidebar'
import { DatabaseConnectionCard } from '@/widgets/database-connection-card'
import { DatabaseUsageCard } from '@/widgets/database-usage-card'
import { CreateDatabaseForm } from '@/features/create-database'
import type { DatabaseCredentials, DatabaseRecord } from '@/entities/database'
import { ApiError, databaseApi } from '@/shared/api'
import { Button, Toast } from '@/shared/ui'
import { takePendingDatabaseReveal } from '@/shared/lib/pendingDatabaseReveal'
import { takePendingToast } from '@/shared/lib/pendingToast'
import styles from './DashboardPage.module.css'

export function DashboardPage() {
  const [databases, setDatabases] = useState<DatabaseRecord[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [justCreated, setJustCreated] = useState<DatabaseCredentials | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // La BD recién aprovisionada (login/register por contraseña) y el mensaje
  // de éxito quedan en un puente en memoria, no en location.state — ver
  // pendingDatabaseReveal.ts / pendingToast.ts.
  useEffect(() => {
    const pendingDatabase = takePendingDatabaseReveal()
    if (pendingDatabase) setJustCreated(pendingDatabase)

    const pendingToast = takePendingToast()
    if (pendingToast) setToastMessage(pendingToast)
  }, [])

  function loadDatabases(preferredSelectedId: number | null) {
    setLoadError(null)
    databaseApi
      .getMyDatabases()
      .then((result) => {
        setDatabases(result)
        setSelectedId(preferredSelectedId ?? result[0]?.databaseId ?? null)
      })
      .catch((error) => {
        setLoadError(error instanceof ApiError ? error.message : 'Ocurrió un error inesperado. Intenta de nuevo.')
        setDatabases((prev) => prev ?? [])
      })
  }

  useEffect(() => {
    loadDatabases(null)
  }, [])

  function handleCreated(credentials: DatabaseCredentials) {
    setIsCreating(false)
    setJustCreated(credentials)
  }

  function handleDismissCreated() {
    const createdId = justCreated?.databaseId ?? null
    setJustCreated(null)
    loadDatabases(createdId)
  }

  const selectedDatabase = databases?.find((db) => db.databaseId === selectedId) ?? null

  function renderMain() {
    if (isCreating) {
      return <CreateDatabaseForm onCreated={handleCreated} onCancel={() => setIsCreating(false)} />
    }

    if (justCreated) {
      return (
        <div className={styles.cards}>
          <DatabaseConnectionCard credentials={justCreated} allowDownload />
          <Button variant="primary" onClick={handleDismissCreated}>
            Entendido, ver mis bases de datos
          </Button>
        </div>
      )
    }

    if (databases === null) {
      return <p className={styles.loading}>Cargando tus bases de datos…</p>
    }

    if (selectedDatabase) {
      return (
        <div className={styles.cards}>
          <DatabaseUsageCard database={selectedDatabase} />
        </div>
      )
    }

    if (loadError) {
      return (
        <div className={styles.empty}>
          <p>No pudimos cargar tus bases de datos: {loadError}</p>
          <Button variant="primary" onClick={() => loadDatabases(null)}>
            Reintentar
          </Button>
        </div>
      )
    }

    return (
      <div className={styles.empty}>
        <p>Aún no tienes bases de datos. Crea la primera para empezar a usarla.</p>
        <Button variant="primary" onClick={() => setIsCreating(true)}>
          + Crear base de datos
        </Button>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      {toastMessage && <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />}
      <SiteHeader />
      <main className={styles.content}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>Gestiona tus bases de datos y revisa su estado.</p>
        </div>

        <div className={styles.body}>
          <DatabaseSidebar
            databases={databases ?? []}
            selectedId={selectedId}
            isCreating={isCreating}
            onSelect={(id) => {
              setIsCreating(false)
              setJustCreated(null)
              setSelectedId(id)
            }}
            onCreateClick={() => {
              setJustCreated(null)
              setIsCreating(true)
            }}
          />
          <div className={styles.main}>{renderMain()}</div>
        </div>
      </main>
    </div>
  )
}
