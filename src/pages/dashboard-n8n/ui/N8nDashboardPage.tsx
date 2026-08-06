import { ComingSoonPanel } from '@/shared/ui'
import styles from './N8nDashboardPage.module.css'

export function N8nDashboardPage() {
  return (
    <>
      <div>
        <h1 className={styles.title}>N8N</h1>
        <p className={styles.subtitle}>Crea tu propio workspace de automatización sin intervención manual.</p>
      </div>

      <ComingSoonPanel
        title="Tu workspace de N8N, autogestionado"
        description="Todavía estamos definiendo el flujo con el equipo de backend. Cuando esté listo, vas a poder crear tu instancia desde acá, sin pedírselo a nadie."
        bullets={[
          'Creación de tu usuario/workspace de N8N en un clic, igual que hoy con las bases de datos.',
          'Credenciales o enlace de acceso entregados una sola vez, de forma segura.',
          'Límites por usuario (workflows, ejecuciones, almacenamiento) para evitar abuso de recursos.',
        ]}
      />
    </>
  )
}
