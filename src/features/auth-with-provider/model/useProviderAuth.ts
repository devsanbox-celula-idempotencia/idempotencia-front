import { useEffect, useState } from 'react'
import { authApi } from '@/shared/api'
import type { AuthProviderName } from '@/shared/api'

/**
 * Redirige de verdad al backend para arrancar el flujo OAuth. La sesión se
 * termina de resolver en `pages/oauth-callback`, a donde el backend redirige
 * tras el consentimiento del proveedor.
 */
export function useProviderAuth() {
  const [loadingProvider, setLoadingProvider] = useState<AuthProviderName | null>(null)

  // window.location.href es una navegación completa fuera de la SPA. Si el
  // usuario le da "atrás" antes de completar el login (ej. desde la pantalla
  // de consentimiento), el navegador puede restaurar esta página desde el
  // bfcache con el estado de React congelado tal cual quedó — dejando
  // `loadingProvider` marcado y ambos botones bloqueados para siempre, sin
  // que ningún efecto de montaje vuelva a correr. `pageshow` con
  // `persisted: true` es la señal de que la página volvió del bfcache.
  useEffect(() => {
    function handlePageShow(event: PageTransitionEvent) {
      if (event.persisted) setLoadingProvider(null)
    }
    window.addEventListener('pageshow', handlePageShow)
    return () => window.removeEventListener('pageshow', handlePageShow)
  }, [])

  function continueWith(provider: AuthProviderName) {
    setLoadingProvider(provider)
    window.location.href = authApi.getOAuthRedirectUrl(provider)
  }

  return { continueWith, loadingProvider }
}
