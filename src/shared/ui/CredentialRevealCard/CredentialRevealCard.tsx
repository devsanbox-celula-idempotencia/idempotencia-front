import { useState, type ReactNode } from 'react'
import { copyToClipboard } from '@/shared/lib/copyToClipboard'
import { downloadTextFile } from '@/shared/lib/downloadTextFile'
import { EyeIcon } from '../icons/EyeIcon'
import { EyeOffIcon } from '../icons/EyeOffIcon'
import styles from './CredentialRevealCard.module.css'

export interface CredentialField {
  label: string
  value: string
  /** Ocupa toda la fila — para valores largos (connection strings, URIs). */
  wide?: boolean
  /** Oculta el valor detrás de un toggle de ojo — para secretos como password/api_key. */
  masked?: boolean
}

interface CredentialRevealCardProps {
  title: string
  /** Slot libre para un badge de estado — el card no sabe qué dominio lo usa. */
  badge?: ReactNode
  warningMessage?: string
  fields: CredentialField[]
  /** Si se pasa, aparece el botón de descarga; si no, no hay nada que descargar. */
  downloadFileName?: string
  downloadHeading?: string
  downloadNote?: string
}

function RevealField({ label, value, wide, masked }: CredentialField) {
  const [copied, setCopied] = useState(false)
  const [visible, setVisible] = useState(!masked)

  async function handleCopy() {
    await copyToClipboard(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className={`${styles.field} ${wide ? styles.fieldWide : ''}`}>
      <span className={styles.fieldLabel}>{label}</span>
      <span className={styles.fieldValueRow}>
        <span className={styles.fieldValue}>{visible ? value : '•'.repeat(Math.min(value.length, 24))}</span>
        {masked && (
          <button
            type="button"
            className={styles.iconBtn}
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? `Ocultar ${label}` : `Mostrar ${label}`}
          >
            {visible ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
        <button type="button" className={styles.iconBtn} onClick={handleCopy}>
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </span>
    </div>
  )
}

function formatFieldsAsText(fields: CredentialField[], heading?: string, note?: string): string {
  return [
    ...(heading ? [heading, ''] : []),
    ...fields.map((field) => `${field.label}: ${field.value}`),
    ...(note ? ['', note] : []),
  ].join('\n')
}

export function CredentialRevealCard({
  title,
  badge,
  warningMessage,
  fields,
  downloadFileName,
  downloadHeading,
  downloadNote,
}: CredentialRevealCardProps) {
  function handleDownload() {
    if (!downloadFileName) return
    downloadTextFile(downloadFileName, formatFieldsAsText(fields, downloadHeading, downloadNote))
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        {badge}
      </div>

      {warningMessage && <p className={styles.warning}>{warningMessage}</p>}

      <div className={styles.fields}>
        {fields.map((field) => (
          <RevealField key={field.label} {...field} />
        ))}
      </div>

      {downloadFileName && (
        <button type="button" className={styles.downloadBtn} onClick={handleDownload}>
          Descargar credenciales (.txt)
        </button>
      )}
    </div>
  )
}
