import { ComingSoonPanel } from '@/shared/ui'
import styles from './DnsDashboardPage.module.css'

export function DnsDashboardPage() {
  return (
    <>
      <div>
        <h1 className={styles.title}>DNS</h1>
        <p className={styles.subtitle}>Crea subdominios propios para tus proyectos, con HTTPS automático.</p>
      </div>

      <ComingSoonPanel
        title="Subdominios propios bajo coderhivex.com"
        description="Todavía estamos definiendo el flujo con el equipo de backend. Cuando esté listo, vas a poder pedir tu propio subdominio desde acá, sin pedírselo a nadie."
        bullets={[
          'Elegís el nombre: [tu-nombre].[célula].coderhivex.com, apuntando al servicio que estés desplegando.',
          'El registro DNS (A o CNAME) se crea automáticamente al momento de la solicitud.',
          'Certificado SSL/TLS válido para el subdominio, de forma automática o guiada.',
          'Validación para evitar colisiones de nombres y límite de subdominios por usuario.',
        ]}
      />
    </>
  )
}
