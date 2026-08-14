import { Button } from '@/shared/ui'
import { useCopyToClipboard } from '@/shared/lib/useCopyToClipboard'
import type { DnsRecord } from '@/shared/api'
import styles from './DnsRecordCreatedPanel.module.css'

export function DnsRecordCreatedPanel({ record, onDismiss }: { record: DnsRecord; onDismiss: () => void }) {
  const { state: copyState, copy } = useCopyToClipboard()

  return (
    <div className={styles.card}>
      <span className={styles.badge}>Subdominio listo</span>
      <p className={styles.fqdn}>{record.fqdn}</p>
      <div className={styles.actions}>
        <Button
          type="button"
          variant="secondary"
          className={copyState === 'success' ? styles.copyBtnSuccess : copyState === 'error' ? styles.copyBtnError : undefined}
          onClick={() => copy(record.fqdn)}
        >
          {copyState === 'success' ? 'Copiado' : copyState === 'error' ? 'No se pudo copiar' : 'Copiar'}
        </Button>
        <a href={`https://${record.fqdn}`} target="_blank" rel="noreferrer" className={styles.visitLink}>
          Visitar ↗
        </a>
      </div>
      <p className={styles.note}>Puede tardar hasta un minuto en estar disponible desde todos lados (propagación DNS).</p>
      <Button type="button" variant="primary" onClick={onDismiss}>
        Entendido, ver mis subdominios
      </Button>
    </div>
  )
}
