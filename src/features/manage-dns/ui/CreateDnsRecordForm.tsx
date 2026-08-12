import type { FormEvent } from 'react'
import { Button, Input } from '@/shared/ui'
import { useDnsZone } from '../model/useDnsZone'
import { DNS_QUOTA } from '../model/useManageDnsRecords'
import styles from './CreateDnsRecordForm.module.css'

interface CreateDnsRecordFormProps {
  labelInput: string
  setLabelInput: (value: string) => void
  ipInput: string
  setIpInput: (value: string) => void
  createError: string | null
  isCreating: boolean
  onSubmit: (event: FormEvent) => void
  nameSuggestion: string | null
  cooldownSeconds: number
  quotaReached: boolean
  recordCount: number
}

export function CreateDnsRecordForm({
  labelInput,
  setLabelInput,
  ipInput,
  setIpInput,
  createError,
  isCreating,
  onSubmit,
  nameSuggestion,
  cooldownSeconds,
  quotaReached,
  recordCount,
}: CreateDnsRecordFormProps) {
  const { zone, error: zoneError } = useDnsZone()

  const preview = zone ? zone.pattern.replace('{label}', labelInput.trim().toLowerCase() || '···') : null
  const disabled = isCreating || cooldownSeconds > 0 || quotaReached

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <div>
        <h2 className={styles.title}>Nuevo subdominio</h2>
        <p className={styles.subtitle}>
          Cuota: {recordCount}/{DNS_QUOTA}
          {quotaReached && ' — llegaste al límite. Eliminá uno para poder crear otro.'}
        </p>
      </div>

      {preview && <p className={styles.preview}>{preview}</p>}
      {zoneError && <p className={styles.hint}>No pudimos cargar el dominio: {zoneError}</p>}

      <div className={styles.row}>
        <Input
          label="Nombre"
          name="dnsLabel"
          value={labelInput}
          onChange={(e) => setLabelInput(e.target.value)}
          disabled={disabled}
          placeholder="airflow"
        />
        <Input
          label="IP pública de tu servidor"
          name="dnsIp"
          value={ipInput}
          onChange={(e) => setIpInput(e.target.value)}
          disabled={disabled}
          placeholder="203.0.113.10"
        />
        <Button type="submit" disabled={disabled}>
          {cooldownSeconds > 0 ? `Esperá ${cooldownSeconds}s` : isCreating ? 'Creando…' : '+ Crear subdominio'}
        </Button>
      </div>

      <p className={styles.hint}>
        Necesitamos la IP <strong>pública</strong> de tu servidor, no la de tu red local — no sirven las que empiezan
        con <code>10.</code>, <code>192.168.</code>, <code>172.16</code>–<code>172.31</code> ni <code>127.</code>. Si
        no la sabés, corré <code>curl ifconfig.me</code> en tu servidor.
      </p>

      {createError && (
        <p className={styles.error}>
          {createError}
          {nameSuggestion && (
            <>
              {' '}
              ¿Probás con{' '}
              <button type="button" className={styles.suggestionBtn} onClick={() => setLabelInput(nameSuggestion)}>
                {nameSuggestion}
              </button>
              ?
            </>
          )}
        </p>
      )}
    </form>
  )
}
