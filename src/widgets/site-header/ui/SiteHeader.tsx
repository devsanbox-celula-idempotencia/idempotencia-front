import { Link, useLocation } from 'react-router-dom'
import { useSession } from '@/entities/user'
import { LogoutButton } from '@/features/logout'
import { Logo, ThemeToggle } from '@/shared/ui'
import { getInitials } from '@/shared/lib/getInitials'
import styles from './SiteHeader.module.css'

export function SiteHeader() {
  const { user, isAuthenticated } = useSession()
  const location = useLocation()

  return (
    <header className={styles.header}>
      <Link to="/" className={styles.brand}>
        <Logo />
        <span className={styles.wordmark}>idempotencia</span>
      </Link>

      <div className={styles.actions}>
        {isAuthenticated && user ? (
          <>
            <Link to="/dashboard" className={styles.userChip}>
              <span className={styles.avatar}>{getInitials(user.fullName)}</span>
              <span className={styles.userName}>{user.fullName}</span>
            </Link>
            <LogoutButton />
          </>
        ) : (
          <>
            {/* No mostrar el link a la página en la que ya estás — antes
                aparecían "Iniciar sesión" y "Registrarme" incluso estando
                en /login o /register. */}
            {location.pathname !== '/login' && (
              <Link to="/login" className={styles.navLink}>
                Iniciar sesión
              </Link>
            )}
            {location.pathname !== '/register' && (
              <Link to="/register" className={styles.navLink}>
                Registrarme
              </Link>
            )}
          </>
        )}
        <ThemeToggle />
      </div>
    </header>
  )
}
