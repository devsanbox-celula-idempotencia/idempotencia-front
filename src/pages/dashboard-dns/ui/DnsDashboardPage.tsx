import { ManageDnsPanel } from '@/features/manage-dns'
import styles from './DnsDashboardPage.module.css'

export function DnsDashboardPage() {
  return (
    <>
      <div>
        <h1 className={styles.title}>DNS</h1>
        <p className={styles.subtitle}>Creá subdominios propios para tus proyectos, con HTTPS automático.</p>
      </div>

      <ManageDnsPanel />
    </>
  )
}
