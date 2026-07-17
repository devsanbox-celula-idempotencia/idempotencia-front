import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { SiteHeader } from '@/widgets/site-header'
import { DatabaseConnectionCard } from '@/widgets/database-connection-card'
import { useSession } from '@/entities/user'
import type { DatabaseRecord } from '@/entities/database'
import { databaseApi } from '@/shared/api'
import { Button } from '@/shared/ui'
import styles from './WelcomePage.module.css'

export function WelcomePage() {
  const { user } = useSession()
  const [database, setDatabase] = useState<DatabaseRecord | null>(null)

  useEffect(() => {
    if (!user) return
    let cancelled = false
    databaseApi.getMyDatabase(String(user.userId)).then((result) => {
      if (!cancelled) setDatabase(result)
    })
    return () => {
      cancelled = true
    }
  }, [user])

  return (
    <div className={styles.page}>
      <SiteHeader />
      <main className={styles.content}>
        <div className={styles.intro}>
          <span className={styles.kicker}>Tu base de datos está lista</span>
          <h1 className={styles.title}>¡Bienvenido, {user?.fullName.split(' ')[0]}!</h1>
          <p className={styles.subtitle}>
            Acabamos de aprovisionar tu base de datos MySQL. Guarda estas credenciales — es la
            única vez que verás la contraseña completa por aquí.
          </p>
        </div>

        <div className={styles.cardWrap}>
          {database ? (
            <>
              <DatabaseConnectionCard database={database} revealSecretsByDefault allowDownload />
              <Link to="/dashboard">
                <Button variant="primary">Ir al dashboard</Button>
              </Link>
            </>
          ) : (
            <p className={styles.loading}>Cargando tu base de datos…</p>
          )}
        </div>
      </main>
    </div>
  )
}
