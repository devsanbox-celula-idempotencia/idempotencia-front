import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SiteHeader } from '@/widgets/site-header'
import { PlatformStatsGrid } from '@/widgets/platform-stats'
import { Button } from '@/shared/ui'
import { fadeInUp } from '@/shared/lib/motion'
import styles from './LandingPage.module.css'

const heroContainer = {
  initial: {},
  animate: { transition: { staggerChildren: 0.08 } },
}

export function LandingPage() {
  return (
    <main className={styles.page}>
      <SiteHeader />

      <motion.section className={styles.hero} initial="initial" animate="animate" variants={heroContainer}>
        <motion.span variants={fadeInUp} className={styles.kicker}>
          Bases de datos gratuitas para tus proyectos
        </motion.span>
        <motion.h1 variants={fadeInUp} className={styles.title}>
          Tu propia base de datos, lista en segundos
        </motion.h1>
        <motion.p variants={fadeInUp} className={styles.subtitle}>
          Inicia sesión con Google o GitHub y crea la base de datos que necesites desde tu
          dashboard, con el motor que elijas y credenciales propias.
        </motion.p>
        <motion.div variants={fadeInUp} className={styles.ctaRow}>
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
        </motion.div>
      </motion.section>

      <section className={styles.statsSection}>
        <motion.h2
          className={styles.statsHeading}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
        >
          La plataforma en números
        </motion.h2>
        <PlatformStatsGrid />
      </section>
    </main>
  )
}
