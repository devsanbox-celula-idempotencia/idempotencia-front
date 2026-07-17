import { useEffect, useState } from 'react'
import { SiteHeader } from '@/widgets/site-header'
import { DatabaseSidebar } from '@/widgets/database-sidebar'
import { DatabaseConnectionCard } from '@/widgets/database-connection-card'
import { DatabaseUsageCard } from '@/widgets/database-usage-card'
import { useSession } from '@/entities/user'
import type { DatabaseRecord } from '@/entities/database'
import { databaseApi } from '@/shared/api'
import styles from './DashboardPage.module.css'

export function DashboardPage() {
  const { user } = useSession()
  const [databases, setDatabases] = useState<DatabaseRecord[] | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    let cancelled = false
    const userId = String(user.userId)

    databaseApi.getMyDatabases(userId).then(async (result) => {
      // Puede no existir todavía si el usuario vino de un login real cuya
      // cuenta no pasó por el flujo de registro de esta app (sin DB mock asociada).
      const resolved = result.length > 0 ? result : [await databaseApi.provisionDatabase(userId)]
      if (!cancelled) {
        setDatabases(resolved)
        setSelectedId(resolved[0]?.id ?? null)
      }
    })
    return () => {
      cancelled = true
    }
  }, [user])

  const selectedDatabase = databases?.find((db) => db.id === selectedId) ?? null

  return (
    <div className={styles.page}>
      <SiteHeader />
      <main className={styles.content}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>Gestiona tus bases de datos y revisa su estado.</p>
        </div>

        {databases && selectedDatabase ? (
          <div className={styles.body}>
            <DatabaseSidebar databases={databases} selectedId={selectedId} onSelect={setSelectedId} />
            <div className={styles.main}>
              <div className={styles.cards}>
                <DatabaseConnectionCard database={selectedDatabase} />
                <DatabaseUsageCard database={selectedDatabase} />
              </div>
            </div>
          </div>
        ) : (
          <p className={styles.loading}>Cargando tus bases de datos…</p>
        )}
      </main>
    </div>
  )
}
