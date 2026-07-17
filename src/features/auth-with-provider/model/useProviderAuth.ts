import { useState } from 'react'
import { authApi } from '@/shared/api'
import type { AuthProviderName } from '@/shared/api'

/**
 * Redirige de verdad al backend para arrancar el flujo OAuth. La sesión se
 * termina de resolver en `pages/oauth-callback`, a donde el backend redirige
 * tras el consentimiento del proveedor.
 */
export function useProviderAuth() {
  const [loadingProvider, setLoadingProvider] = useState<AuthProviderName | null>(null)

  function continueWith(provider: AuthProviderName) {
    setLoadingProvider(provider)
    window.location.href = authApi.getOAuthRedirectUrl(provider)
  }

  return { continueWith, loadingProvider }
}
