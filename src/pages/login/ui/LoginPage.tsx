import { Link } from 'react-router-dom'
import { SiteHeader } from '@/widgets/site-header'
import { ProviderAuthButtons } from '@/features/auth-with-provider'
import { PasswordAuthForm } from '@/features/auth-with-password'
import { resetMockData } from '@/shared/api'
import styles from './LoginPage.module.css'

export function LoginPage() {
  function handleResetDemoData() {
    resetMockData()
    window.location.href = '/'
  }

  return (
    <div className={styles.page}>
      <SiteHeader />
      <main className={styles.content}>
        <div className={styles.card}>
          <span className={styles.kicker}>Bienvenido de nuevo</span>
          <h1 className={styles.title}>Inicia sesión en tu cuenta</h1>
          <p className={styles.subtitle}>Accede con tu correo y contraseña, o con el proveedor que usaste antes.</p>

          <PasswordAuthForm mode="login" />

          <div className={styles.divider}>o continúa con</div>

          <div className={styles.buttons}>
            <ProviderAuthButtons mode="login" />
          </div>

          <p className={styles.crossLink}>
            ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
          </p>

          <button type="button" className={styles.resetLink} onClick={handleResetDemoData}>
            Restablecer datos de demo
          </button>
        </div>
      </main>
    </div>
  )
}
