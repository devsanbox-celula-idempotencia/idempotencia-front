import { Link } from 'react-router-dom'
import { useSession } from '@/entities/user'
import { LogoutButton } from '@/features/logout'
import { Logo } from '@/shared/ui'
import { getInitials } from '@/shared/lib/getInitials'
import styles from './SiteHeader.module.css'

export function SiteHeader() {
  const { user, isAuthenticated } = useSession()

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
            <Link to="/login" className={styles.navLink}>
              Iniciar sesión
            </Link>
            <Link to="/register" className={styles.navLink}>
              Registrarme
            </Link>
          </>
        )}
      </div>
    </header>
  )
}
