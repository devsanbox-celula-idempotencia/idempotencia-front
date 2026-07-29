import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { authApi } from '@/shared/api'
import type { AuthResponse, Role } from '@/shared/api'
import { useSession } from '@/entities/user'
import { SiteHeader } from '@/widgets/site-header'
import { setPendingToast } from '@/shared/lib/pendingToast'
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
  const hasProcessedRef = useRef(false)

  useEffect(() => {
    if (hasProcessedRef.current) return
    hasProcessedRef.current = true

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
      mySqlDatabase: null,
    }

    // El token y el resto de los datos viajan en la query string (limitación
    // conocida del backend, ver guía de integración). No hace falta limpiar
    // la URL a mano: `navigate(..., { replace: true })` ya reemplaza esta
    // entrada del historial por /dashboard, así que el query string sensible
    // nunca llega a persistir. Llamar `window.history.replaceState` aparte
    // desincroniza el historial interno de `BrowserRouter` (no pasa por sus
    // propios métodos) y causaba un loop de renders infinito en esta página.
    setSession(authResponse)
    authApi.recordExternalSession(authResponse)
    // El backend aprovisiona la BD MySQL principal durante el propio callback
    // OAuth, pero la contraseña ya no viaja por API para este flujo — la manda
    // por correo. No hay forma de saber desde acá si este login creó la BD
    // recién (la respuesta no trae un flag de "usuario nuevo"), así que el
    // aviso queda redactado para ser cierto sin importar si es la primera vez.
    setPendingToast(
      'Si es tu primer inicio de sesión con este proveedor, te enviamos las credenciales de tu base de datos por correo.',
    )
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
