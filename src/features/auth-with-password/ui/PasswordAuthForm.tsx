import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button, Input } from '@/shared/ui'
import { usePasswordAuth, type LoginErrorKind } from '../model/usePasswordAuth'
import styles from './PasswordAuthForm.module.css'

interface PasswordAuthFormProps {
  mode: 'login' | 'register'
  /** Solo aplica en login: se llama con la clasificación actual del error (o null si no hay). */
  onLoginErrorKindChange?: (kind: LoginErrorKind) => void
}

export function PasswordAuthForm({ mode, onLoginErrorKindChange }: PasswordAuthFormProps) {
  const {
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    fullName,
    setFullName,
    fieldErrors,
    generalError,
    loginErrorKind,
    isSubmitting,
    disableSubmit,
    handleSubmit,
  } = usePasswordAuth(mode)

  useEffect(() => {
    onLoginErrorKindChange?.(loginErrorKind)
  }, [loginErrorKind, onLoginErrorKindChange])

  const isOAuthAccount = loginErrorKind === 'oauth-account'

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {mode === 'register' && (
        <Input
          label="Nombre completo"
          name="fullName"
          autoComplete="name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          error={fieldErrors.fullName}
        />
      )}
      <Input
        label="Correo"
        name="email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={fieldErrors.email}
        invalid={loginErrorKind === 'not-found'}
      />
      <Input
        label="Contraseña"
        name="password"
        type="password"
        autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={fieldErrors.password}
        invalid={loginErrorKind === 'wrong-password'}
        disabled={isOAuthAccount}
      />
      {mode === 'register' && (
        <Input
          label="Confirmar contraseña"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={fieldErrors.confirmPassword}
        />
      )}
      {generalError && <p className={styles.generalError}>{generalError}</p>}
      {loginErrorKind === 'not-found' && (
        <p className={styles.errorAction}>
          <Link to="/register">Crea una cuenta</Link> con ese correo.
        </p>
      )}
      {isOAuthAccount && (
        <p className={styles.errorAction}>Usa el botón de Google o GitHub correspondiente, más abajo.</p>
      )}
      <Button type="submit" fullWidth disabled={disableSubmit || isOAuthAccount}>
        {isSubmitting ? 'Enviando…' : mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
      </Button>
    </form>
  )
}
