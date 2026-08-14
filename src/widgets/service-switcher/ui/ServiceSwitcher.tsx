import { Link, useLocation } from 'react-router-dom'
import styles from './ServiceSwitcher.module.css'

interface Service {
  path: string
  label: string
  available: boolean
}

const SERVICES: Service[] = [
  { path: '/dashboard/databases', label: 'Bases de datos', available: true },
  { path: '/dashboard/ai', label: 'IA', available: true },
  { path: '/dashboard/n8n', label: 'N8N', available: false },
  { path: '/dashboard/dns', label: 'DNS', available: true },
]

export function ServiceSwitcher() {
  const location = useLocation()

  return (
    <nav className={styles.switcher} aria-label="Servicios de la plataforma">
      {SERVICES.map((service) => {
        const isActive = location.pathname.startsWith(service.path)
        return (
          <Link
            key={service.path}
            to={service.path}
            className={`${styles.tab} ${isActive ? styles.tabActive : ''}`}
          >
            {service.label}
            {!service.available && <span className={styles.soon}>Próximamente</span>}
          </Link>
        )
      })}
    </nav>
  )
}
