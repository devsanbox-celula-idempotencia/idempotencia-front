import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { authApi } from '@/shared/api'
import type { AuthResponse, Role } from '@/shared/api'
import { useSession } from '@/entities/user'
import { SiteHeader } from '@/widgets/site-header'
import styles from './OAuthCallbackPage.module.css'

/**
 * Destino del redirect real de OAuth (ver AuthController.cs en el backend).
 * El backend manda el AuthResponse completo como query params porque el
 * navegador, tras el redirect de un proveedor externo, no puede "leer" un
 * body JSON de vuelta hacia la SPA — solo la URL.
 */
export function OAuthCallbackPage() {
  const [searchParams] = useSearchParams()
  const { setSession } = useSession()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const backendError = searchParams.get('error')
    if (backendError) {
      setError(backendError)
      return
    }

    const token = searchParams.get('token')
    const expiresAt = searchParams.get('expiresAt')
    const userId = searchParams.get('userId')
    const email = searchParams.get('email')
    const fullName = searchParams.get('fullName')
    const role = searchParams.get('role')

    if (!token || !expiresAt || !userId || !email || !fullName || !role) {
      setError('La respuesta de autenticación llegó incompleta.')
      return
    }

    const authResponse: AuthResponse = {
      token,
      expiresAt,
      userId: Number(userId),
      email,
      fullName,
      role: role as Role,
    }

    setSession(authResponse)
    authApi.recordExternalSession(authResponse)
    navigate('/dashboard', { replace: true })
  }, [searchParams, setSession, navigate])

  return (
    <div className={styles.page}>
      <SiteHeader />
      <main className={styles.content}>
        {error ? (
          <div className={styles.card}>
            <h1 className={styles.title}>No se pudo iniciar sesión</h1>
            <p className={styles.message}>{error}</p>
            <Link to="/login" className={styles.link}>
              Volver a intentar
            </Link>
          </div>
        ) : (
          <p className={styles.loading}>Conectando tu cuenta…</p>
        )}
      </main>
    </div>
  )
}
