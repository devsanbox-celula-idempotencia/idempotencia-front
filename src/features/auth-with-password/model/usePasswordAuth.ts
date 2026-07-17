import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError, authApi } from '@/shared/api'
import { useSession } from '@/entities/user'

interface FieldErrors {
  email?: string
  password?: string
  fullName?: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// Solo letras (incluye acentos/ñ) y espacios — sin números ni símbolos.
const FULL_NAME_RE = /^[\p{L}\s]+$/u

/** Reglas exactas documentadas por backend para /auth/register y /auth/login. */
function validate(
  mode: 'login' | 'register',
  values: { email: string; password: string; fullName: string },
): FieldErrors {
  const errors: FieldErrors = {}
  const email = values.email.trim()
  const password = values.password
  const fullName = values.fullName.trim()

  if (!email) errors.email = 'Falta rellenar el campo Correo.'
  else if (email.length > 150) errors.email = 'El correo no puede superar los 150 caracteres.'
  else if (!EMAIL_RE.test(email)) errors.email = 'El formato del correo no es válido.'

  if (!password) errors.password = 'Falta rellenar el campo Contraseña.'
  else if (password.length < 8) errors.password = 'La contraseña debe tener mínimo 8 caracteres.'
  else if (password.length > 100) errors.password = 'La contraseña no puede superar los 100 caracteres.'

  if (mode === 'register') {
    if (!fullName) errors.fullName = 'Falta rellenar el campo Nombre completo.'
    else if (fullName.length > 150) errors.fullName = 'El nombre no puede superar los 150 caracteres.'
    else if (!FULL_NAME_RE.test(fullName)) {
      errors.fullName = 'El nombre completo no puede contener números ni caracteres especiales.'
    }
  }

  return errors
}

export function usePasswordAuth(mode: 'login' | 'register') {
  const { setSession } = useSession()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setGeneralError(null)

    const errors = validate(mode, { email, password, fullName })
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    const trimmedEmail = email.trim()
    const trimmedFullName = fullName.trim()

    setIsSubmitting(true)
    try {
      const authResponse =
        mode === 'register'
          ? await authApi.registerWithPassword({ email: trimmedEmail, password, fullName: trimmedFullName })
          : await authApi.loginWithPassword({ email: trimmedEmail, password })
      setSession(authResponse)
      navigate('/dashboard')
    } catch (error) {
      setGeneralError(error instanceof ApiError ? error.message : 'Ocurrió un error inesperado. Intenta de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    email,
    setEmail,
    password,
    setPassword,
    fullName,
    setFullName,
    fieldErrors,
    generalError,
    isSubmitting,
    handleSubmit,
  }
}
