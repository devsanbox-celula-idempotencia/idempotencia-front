import { useCallback } from 'react'
import { useSession } from '@/entities/user'
import { AiGatewayError } from '@/shared/api'

/**
 * Traduce errores del gateway de IA a mensajes de usuario, ramificando por
 * `code` (el texto de `message` es libre y puede cambiar). Un 401
 * `invalid_token` es la sesión de la plataforma vencida, no una API-Key
 * inválida — tratarlo como error de key le muestra al usuario el mensaje
 * equivocado, así que acá mismo se cierra la sesión para que el guard de
 * rutas mande a `/login`.
 *
 * Envuelto en `useCallback` para que su identidad sea estable entre renders
 * (depende de `clearSession`, que solo cambia si cambia el usuario) — así
 * los hooks que la usan pueden incluirla en su array de dependencias sin
 * refetch de más.
 */
export function useAiKeyErrorHandler() {
  const { clearSession } = useSession()

  return useCallback(
    (error: unknown): string => {
      if (!(error instanceof AiGatewayError)) {
        return 'Ocurrió un error inesperado. Intenta de nuevo.'
      }

      switch (error.code) {
        case 'invalid_token':
          clearSession()
          return 'Tu sesión expiró. Inicia sesión de nuevo.'
        case 'user_not_found':
          // No es culpa del usuario: el gateway no encuentra su UserId, señal de que apunta a otra base.
          return 'Ocurrió un problema con tu cuenta en el servicio de IA. Ya le avisamos al equipo.'
        case 'not_found':
          return 'Esa clave ya no existe.'
        case 'feature_not_configured':
          // Código desplegado, falta configuración en el servidor — no es un bug del front.
          return 'El servicio de IA todavía no está disponible. Intenta más tarde.'
        case 'conflict':
        case 'invalid_request_error':
        case 'rate_limit_error':
        case 'api_error':
        default:
          return error.message
      }
    },
    [clearSession],
  )
}
