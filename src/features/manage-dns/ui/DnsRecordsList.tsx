import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Button, ConfirmDialog } from '@/shared/ui'
import { copyToClipboard } from '@/shared/lib/copyToClipboard'
import { formatRelativeDate } from '@/shared/lib/formatRelativeDate'
import type { DnsRecord } from '@/shared/api'
import { ReassignIpDialog } from './ReassignIpDialog'
import styles from './DnsRecordsList.module.css'

interface DnsRecordsListProps {
  records: DnsRecord[]
  pendingReassignId: number | null
  reassignIpInput: string
  setReassignIpInput: (value: string) => void
  reassignError: string | null
  isReassigning: boolean
  onRequestReassign: (id: number, currentIp: string) => void
  onCancelReassign: () => void
  onConfirmReassign: () => void
  pendingDeleteId: number | null
  deleteError: string | null
  isDeleting: boolean
  onRequestDelete: (id: number) => void
  onCancelDelete: () => void
  onConfirmDelete: () => void
}

function CopyFqdnButton({ fqdn }: { fqdn: string }) {
  const [copied, setCopied] = useState(false)
  async function handleCopy() {
    await copyToClipboard(fqdn)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button type="button" className={styles.copyBtn} onClick={handleCopy}>
      {copied ? 'Copiado' : 'Copiar'}
    </button>
  )
}

export function DnsRecordsList({
  records,
  pendingReassignId,
  reassignIpInput,
  setReassignIpInput,
  reassignError,
  isReassigning,
  onRequestReassign,
  onCancelReassign,
  onConfirmReassign,
  pendingDeleteId,
  deleteError,
  isDeleting,
  onRequestDelete,
  onCancelDelete,
  onConfirmDelete,
}: DnsRecordsListProps) {
  if (records.length === 0) {
    return <p className={styles.empty}>Todavía no tenés ningún subdominio. Creá el primero arriba.</p>
  }

  const reassignTarget = records.find((r) => r.dnsRecordId === pendingReassignId)
  const deleteTarget = records.find((r) => r.dnsRecordId === pendingDeleteId)

  return (
    <div className={styles.list}>
      {records.map((record) => (
        <div key={record.dnsRecordId} className={styles.row}>
          <div className={styles.rowMain}>
            <a href={`https://${record.fqdn}`} target="_blank" rel="noreferrer" className={styles.fqdnLink}>
              {record.fqdn}
            </a>
            <CopyFqdnButton fqdn={record.fqdn} />
          </div>

          <div className={styles.meta}>
            <span>
              Apunta a: <strong>{record.ipAddress}</strong>
            </span>
            <span>Creado {formatRelativeDate(record.createdAt)}</span>
          </div>

          <div className={styles.actions}>
            <Button variant="ghost" onClick={() => onRequestReassign(record.dnsRecordId, record.ipAddress)}>
              Reapuntar
            </Button>
            <Button variant="secondary" className={styles.deleteBtn} onClick={() => onRequestDelete(record.dnsRecordId)}>
              Eliminar
            </Button>
          </div>
        </div>
      ))}

      <AnimatePresence>
        {reassignTarget && (
          <ReassignIpDialog
            key="reassign-ip-dialog"
            fqdn={reassignTarget.fqdn}
            ipAddress={reassignIpInput}
            setIpAddress={setReassignIpInput}
            error={reassignError}
            isSubmitting={isReassigning}
            onConfirm={onConfirmReassign}
            onCancel={onCancelReassign}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteTarget && (
          <ConfirmDialog
            key="delete-dns-record-confirm"
            title={`Eliminar ${deleteTarget.fqdn}`}
            message={`El sitio va a dejar de responder inmediatamente. El nombre queda libre y cualquiera lo puede volver a pedir.`}
            confirmLabel="Eliminar"
            danger
            confirmationText={deleteTarget.label}
            isSubmitting={isDeleting}
            errorMessage={deleteError}
            onConfirm={onConfirmDelete}
            onCancel={onCancelDelete}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
