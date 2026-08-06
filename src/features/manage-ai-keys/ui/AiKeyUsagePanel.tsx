import { useAiKeyUsage } from '../model/useAiKeyUsage'
import styles from './AiKeyUsagePanel.module.css'

const numberFormat = new Intl.NumberFormat('es-CO')

export function AiKeyUsagePanel({ apiKeyId }: { apiKeyId: number }) {
  const { summary, error, loading } = useAiKeyUsage(apiKeyId)

  if (loading) return <p className={styles.status}>Cargando consumo del mes…</p>
  if (error) return <p className={styles.status}>No pudimos cargar el consumo: {error}</p>
  if (!summary) return null

  return (
    <div className={styles.panel}>
      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Solicitudes</span>
          <span className={styles.statValue}>{numberFormat.format(summary.totalRequests)}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Tokens de entrada</span>
          <span className={styles.statValue}>{numberFormat.format(summary.promptTokens)}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Tokens de salida</span>
          <span className={styles.statValue}>{numberFormat.format(summary.completionTokens)}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Total</span>
          <span className={styles.statValue}>{numberFormat.format(summary.totalTokens)}</span>
        </div>
      </div>

      {summary.days.length > 0 && (
        <div className={styles.days}>
          {summary.days.map((day) => (
            <div key={day.day} className={styles.dayRow}>
              <span>{day.day}</span>
              <span>{numberFormat.format(day.requests)} solicitudes</span>
              <span>{numberFormat.format(day.totalTokens)} tokens</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
