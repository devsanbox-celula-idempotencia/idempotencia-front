import { useState, type InputHTMLAttributes } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { EyeIcon } from '../icons/EyeIcon'
import { EyeOffIcon } from '../icons/EyeOffIcon'
import styles from './Input.module.css'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  /** Resalta el campo como inválido sin mostrar texto propio (ej. error general del servidor que ya se muestra en otro lugar). */
  invalid?: boolean
}

export function Input({ label, error, invalid, id, name, className, type, ...rest }: InputProps) {
  const inputId = id ?? name
  const isPassword = type === 'password'
  const [passwordVisible, setPasswordVisible] = useState(false)

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={inputId}>
        {label}
      </label>
      <div className={styles.inputWrapper}>
        <input
          id={inputId}
          name={name}
          type={isPassword && passwordVisible ? 'text' : type}
          aria-invalid={Boolean(error || invalid)}
          className={[
            styles.input,
            isPassword ? styles.inputWithToggle : '',
            error || invalid ? styles.inputError : '',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            className={styles.toggleBtn}
            onClick={() => setPasswordVisible((visible) => !visible)}
            aria-label={passwordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {passwordVisible ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
      </div>
      {/* Solo opacity, nunca height — la regla del rebrand es no animar layout. */}
      <AnimatePresence>
        {error && (
          <motion.p className={styles.error} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
