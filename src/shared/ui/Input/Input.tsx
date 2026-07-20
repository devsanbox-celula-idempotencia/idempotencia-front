import type { InputHTMLAttributes } from 'react'
import styles from './Input.module.css'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export function Input({ label, error, id, name, className, ...rest }: InputProps) {
  const inputId = id ?? name

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={inputId}>
        {label}
      </label>
      <input
        id={inputId}
        name={name}
        className={[styles.input, error ? styles.inputError : '', className].filter(Boolean).join(' ')}
        {...rest}
      />
      {error && <p className={styles.error}>{error}</p>}
    </div>
  )
}
