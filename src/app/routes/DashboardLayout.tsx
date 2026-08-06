import { AnimatePresence, motion } from 'framer-motion'
import { Outlet, useLocation } from 'react-router-dom'
import { SiteHeader } from '@/widgets/site-header'
import { ServiceSwitcher } from '@/widgets/service-switcher'
import { fadeIn } from '@/shared/lib/motion'
import styles from './DashboardLayout.module.css'

/**
 * Shell compartido por los servicios autogestionados (bases de datos, IA,
 * N8N, DNS) — header + navegación entre servicios una sola vez, cada
 * servicio es una ruta hija que solo aporta su contenido.
 *
 * El fade de `<Outlet/>` va con su propio `AnimatePresence` acá adentro (no
 * en `AppRouter`), a propósito: cambiar de servicio no debe re-animar el
 * header ni el switcher, solo el contenido.
 */
export function DashboardLayout() {
  const location = useLocation()

  return (
    <div className={styles.page}>
      <SiteHeader />
      <ServiceSwitcher />
      <main className={styles.content}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            className={styles.routeTransition}
            initial={fadeIn.initial}
            animate={fadeIn.animate}
            exit={fadeIn.exit}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
