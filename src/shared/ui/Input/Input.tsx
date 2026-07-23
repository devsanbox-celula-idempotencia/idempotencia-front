import type { InputHTMLAttributes } from 'react'
import styles from './Input.module.css'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  /** Resalta el campo como inválido sin mostrar texto propio (ej. error general del servidor que ya se muestra en otro lugar). */
  invalid?: boolean
}

export function Input({ label, error, invalid, id, name, className, ...rest }: InputProps) {
  const inputId = id ?? name

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={inputId}>
        {label}
      </label>
      <input
        id={inputId}
        name={name}
        aria-invalid={Boolean(error || invalid)}
        className={[styles.input, error || invalid ? styles.inputError : '', className].filter(Boolean).join(' ')}
        {...rest}
      />
      {error && <p className={styles.error}>{error}</p>}
    </div>
  )
}
