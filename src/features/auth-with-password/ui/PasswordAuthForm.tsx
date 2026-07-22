import { Button, Input } from '@/shared/ui'
import { usePasswordAuth } from '../model/usePasswordAuth'
import styles from './PasswordAuthForm.module.css'

interface PasswordAuthFormProps {
  mode: 'login' | 'register'
}

export function PasswordAuthForm({ mode }: PasswordAuthFormProps) {
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
    isSubmitting,
    handleSubmit,
  } = usePasswordAuth(mode)

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {mode === 'register' && (
        <Input
          label="Nombre completo"
          name="fullName"
          autoComplete="name"
          maxLength={150}
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
        maxLength={150}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={fieldErrors.email}
      />
      <Input
        label="Contraseña"
        name="password"
        type="password"
        autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
        maxLength={100}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={fieldErrors.password}
      />
      {mode === 'register' && (
        <Input
          label="Confirmar contraseña"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          maxLength={100}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={fieldErrors.confirmPassword}
        />
      )}
      {generalError && <p className={styles.generalError}>{generalError}</p>}
      <Button type="submit" fullWidth disabled={isSubmitting}>
        {isSubmitting ? 'Enviando…' : mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
      </Button>
    </form>
  )
}
