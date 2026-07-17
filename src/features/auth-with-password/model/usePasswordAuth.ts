import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError, authApi, databaseApi } from '@/shared/api'
import { useSession } from '@/entities/user'

interface FieldErrors {
  email?: string
  password?: string
  fullName?: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Reglas exactas documentadas por backend para /auth/register y /auth/login. */
function validate(
  mode: 'login' | 'register',
  values: { email: string; password: string; fullName: string },
): FieldErrors {
  const errors: FieldErrors = {}

  if (!values.email) errors.email = 'El correo es obligatorio.'
  else if (values.email.length > 150) errors.email = 'Máximo 150 caracteres.'
  else if (!EMAIL_RE.test(values.email)) errors.email = 'Formato de correo inválido.'

  if (!values.password) errors.password = 'La contraseña es obligatoria.'
  else if (values.password.length < 8 || values.password.length > 100) {
    errors.password = 'Debe tener entre 8 y 100 caracteres.'
  }

  if (mode === 'register') {
    if (!values.fullName) errors.fullName = 'El nombre es obligatorio.'
    else if (values.fullName.length > 150) errors.fullName = 'Máximo 150 caracteres.'
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

    setIsSubmitting(true)
    try {
      if (mode === 'register') {
        const authResponse = await authApi.registerWithPassword({ email, password, fullName })
        setSession(authResponse)
        await databaseApi.provisionDatabase(String(authResponse.userId))
        navigate('/welcome')
      } else {
        const authResponse = await authApi.loginWithPassword({ email, password })
        setSession(authResponse)
        navigate('/dashboard')
      }
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
