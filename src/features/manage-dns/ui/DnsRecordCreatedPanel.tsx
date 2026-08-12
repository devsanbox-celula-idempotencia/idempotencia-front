import { useState } from 'react'
import { Button } from '@/shared/ui'
import { copyToClipboard } from '@/shared/lib/copyToClipboard'
import type { DnsRecord } from '@/shared/api'
import styles from './DnsRecordCreatedPanel.module.css'

export function DnsRecordCreatedPanel({ record, onDismiss }: { record: DnsRecord; onDismiss: () => void }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await copyToClipboard(record.fqdn)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className={styles.card}>
      <span className={styles.badge}>Subdominio listo</span>
      <p className={styles.fqdn}>{record.fqdn}</p>
      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={handleCopy}>
          {copied ? 'Copiado' : 'Copiar'}
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
