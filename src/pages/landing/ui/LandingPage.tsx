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

const servicesContainer = {
  initial: {},
  animate: { transition: { staggerChildren: 0.06 } },
}

interface ServiceInfo {
  title: string
  description: string
  available: boolean
}

const SERVICES: ServiceInfo[] = [
  {
    title: 'Bases de datos',
    description: 'Creá bases de datos en SQL Server, PostgreSQL, MySQL o MongoDB, con credenciales propias en segundos.',
    available: true,
  },
  {
    title: 'IA como servicio',
    description:
      'Generá tu propia API-Key y consumí un modelo de IA compatible con el SDK de OpenAI desde tus proyectos.',
    available: true,
  },
  {
    title: 'N8N',
    description: 'Tu propio workspace de automatización, autogestionado, sin pedírselo a nadie.',
    available: false,
  },
  {
    title: 'DNS',
    description: 'Subdominios propios bajo coderhivex.com para tus proyectos, con HTTPS automático.',
    available: true,
  },
]

export function LandingPage() {
  return (
    <main className={styles.page}>
      <SiteHeader />

      <motion.section className={styles.hero} initial="initial" animate="animate" variants={heroContainer}>
        <motion.span variants={fadeInUp} className={styles.kicker}>
          Infraestructura gratuita para tus proyectos
        </motion.span>
        <motion.h1 variants={fadeInUp} className={styles.title}>
          Todo lo que tu proyecto necesita, en un solo lugar
        </motion.h1>
        <motion.p variants={fadeInUp} className={styles.subtitle}>
          Bases de datos, IA como servicio, automatización con N8N y subdominios propios —
          aprovisionados por vos mismo desde un solo dashboard, sin pedírselo a nadie.
        </motion.p>
        <motion.div variants={fadeInUp} className={styles.ctaRow}>
          <Link to="/register">
            <Button variant="primary" className={styles.ctaButton}>
              Empezar gratis
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="secondary" className={styles.ctaButton}>
              Ya tengo cuenta
            </Button>
          </Link>
        </motion.div>
      </motion.section>

      <section className={styles.servicesSection}>
        <motion.h2
          className={styles.sectionHeading}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
        >
          Qué vas a encontrar en la plataforma
        </motion.h2>
        <motion.div
          className={styles.servicesGrid}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.2 }}
          variants={servicesContainer}
        >
          {SERVICES.map((service) => (
            <motion.div key={service.title} className={styles.serviceCard} variants={fadeInUp}>
              <div className={styles.serviceHeader}>
                <h3 className={styles.serviceTitle}>{service.title}</h3>
                <span className={`${styles.serviceBadge} ${service.available ? styles.badgeAvailable : ''}`}>
                  {service.available ? 'Disponible' : 'Próximamente'}
                </span>
              </div>
              <p className={styles.serviceDescription}>{service.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className={styles.statsSection}>
        <motion.h2
          className={styles.sectionHeading}
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
