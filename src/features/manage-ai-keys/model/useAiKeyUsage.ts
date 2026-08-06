import { useEffect, useState } from 'react'
import { ApiError, aiApi } from '@/shared/api'
import type { AiUsageSummary } from '@/shared/api'

function currentMonthRange(): { start: string; end: string } {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  return { start: start.toISOString().slice(0, 10), end: now.toISOString().slice(0, 10) }
}

/** Consumo del mes en curso — el rango es obligatorio en el gateway, este es el default razonable. */
export function useAiKeyUsage(apiKeyId: number) {
  const [summary, setSummary] = useState<AiUsageSummary | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    setError(null)
    const { start, end } = currentMonthRange()
    aiApi
      .getAiApiKeyUsage(apiKeyId, start, end)
      .then(setSummary)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Ocurrió un error inesperado. Intenta de nuevo.'))
      .finally(() => setLoading(false))
  }, [apiKeyId])

  return { summary, error, loading }
}
