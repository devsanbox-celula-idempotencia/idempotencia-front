import { useEffect, useState } from 'react'
import { ApiError, dnsApi } from '@/shared/api'
import type { DnsZone } from '@/shared/api'

/** Se pide una sola vez al montar — nunca hardcodear el dominio, cambia entre ambientes. */
export function useDnsZone() {
  const [zone, setZone] = useState<DnsZone | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    dnsApi
      .getDnsZone()
      .then(setZone)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Ocurrió un error inesperado. Intenta de nuevo.'))
  }, [])

  return { zone, error }
}
