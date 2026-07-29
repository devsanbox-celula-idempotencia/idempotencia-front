import { Link } from 'react-router-dom'
import { SiteHeader } from '@/widgets/site-header'
import { PlatformStatsGrid } from '@/widgets/platform-stats'
import { Button } from '@/shared/ui'
import styles from './LandingPage.module.css'

export function LandingPage() {
  return (
    <main className={styles.page}>
      <SiteHeader />

      <section className={styles.hero}>
        <span className={styles.kicker}>Bases de datos gratuitas para tus proyectos</span>
        <h1 className={styles.title}>Tu propia base de datos, lista en segundos</h1>
        <p className={styles.subtitle}>
          Inicia sesión con Google o GitHub y crea la base de datos que necesites desde tu
          dashboard, con el motor que elijas y credenciales propias.
        </p>
        <div className={styles.ctaRow}>
          <Link to="/register">
            <Button variant="primary" className={styles.ctaButton}>
              Crear mi base de datos
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="secondary" className={styles.ctaButton}>
              Ya tengo cuenta
            </Button>
          </Link>
        </div>
      </section>

      <section className={styles.statsSection}>
        <h2 className={styles.statsHeading}>La plataforma en números</h2>
        <PlatformStatsGrid />
      </section>
    </main>
  )
}
