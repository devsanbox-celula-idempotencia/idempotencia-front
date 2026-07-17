import { Link } from 'react-router-dom'
import { SiteHeader } from '@/widgets/site-header'
import { ProviderAuthButtons } from '@/features/auth-with-provider'
import { PasswordAuthForm } from '@/features/auth-with-password'
import styles from './RegisterPage.module.css'

export function RegisterPage() {
  return (
    <div className={styles.page}>
      <SiteHeader />
      <main className={styles.content}>
        <div className={styles.card}>
          <span className={styles.kicker}>Empieza gratis</span>
          <h1 className={styles.title}>Crea tu cuenta</h1>
          <p className={styles.subtitle}>
            Al registrarte se crea automáticamente tu base de datos MySQL, lista para usar.
          </p>

          <PasswordAuthForm mode="register" />

          <div className={styles.divider}>o continúa con</div>

          <div className={styles.buttons}>
            <ProviderAuthButtons mode="register" />
          </div>

          <p className={styles.crossLink}>
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
          </p>
        </div>
      </main>
    </div>
  )
}
