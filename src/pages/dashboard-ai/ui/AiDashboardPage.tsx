import { ManageAiKeysPanel } from '@/features/manage-ai-keys'
import styles from './AiDashboardPage.module.css'

export function AiDashboardPage() {
  return (
    <>
      <div>
        <h1 className={styles.title}>IA como servicio</h1>
        <p className={styles.subtitle}>
          Generá tu API-Key y consumí el modelo de IA desde tus propios proyectos.
        </p>
      </div>

      <ManageAiKeysPanel />
    </>
  )
}
