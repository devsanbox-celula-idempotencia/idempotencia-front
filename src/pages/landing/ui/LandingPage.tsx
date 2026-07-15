import workingOnItGif from '@/shared/assets/working-on-it.gif'
import styles from './LandingPage.module.css'

export function LandingPage() {
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <svg width="40" height="40" viewBox="0 0 72 72" aria-hidden="true">
            <defs>
              <linearGradient id="barA" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#ff9d8c" />
                <stop offset="1" stopColor="#ff6b52" />
              </linearGradient>
              <linearGradient id="barB" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#a89bff" />
                <stop offset="1" stopColor="#7a68f2" />
              </linearGradient>
            </defs>
            <rect x="6" y="12" width="60" height="13" rx="6.5" fill="url(#barA)" />
            <rect x="6" y="29.5" width="60" height="13" rx="6.5" fill="url(#barB)" />
            <rect x="6" y="47" width="60" height="13" rx="6.5" fill="url(#barA)" />
          </svg>
          <span className={styles.wordmark}>idempotencia</span>
        </div>

        <figure className={styles.gifFrame}>
          <img
            className={styles.gif}
            src={workingOnItGif}
            alt="Personaje animado exclamando con frustración, transmitiendo el esfuerzo de estar trabajando en ello"
          />
        </figure>

        <h1 className={styles.title}>Estamos trabajando para usted</h1>
        <p className={styles.subtitle}>Próximamente verás nuevas actualizaciones.</p>
      </div>
    </main>
  )
}
