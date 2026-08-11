import { useEffect, useState } from 'react'
import { aiApi } from '@/shared/api'
import type { AiUsageDay } from '@/shared/api'
import { fillUsageDays } from './fillUsageDays'
import { useAiKeyErrorHandler } from './useAiKeyErrorHandler'

function currentMonthRange(): { start: string; end: string } {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  return { start: start.toISOString().slice(0, 10), end: now.toISOString().slice(0, 10) }
}

/** Consumo del mes en curso — el gateway asume los últimos 30 días si no se manda rango, este es el default de la UI. */
export function useAiKeyUsage(apiKeyId: number) {
  const describeAiKeyError = useAiKeyErrorHandler()

  const [totals, setTotals] = useState<{ totalRequests: number; promptTokens: number; completionTokens: number; totalTokens: number } | null>(null)
  const [days, setDays] = useState<AiUsageDay[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    setError(null)
    const { start, end } = currentMonthRange()
    aiApi
      .getAiApiKeyUsage(apiKeyId, start, end)
      .then((summary) => {
        setTotals({
          totalRequests: summary.totalRequests,
          promptTokens: summary.promptTokens,
          completionTokens: summary.completionTokens,
          totalTokens: summary.totalTokens,
        })
        // Rellenado con ceros: el gateway solo manda los días con consumo, sin esto el detalle salta fechas.
        setDays(fillUsageDays(summary.days, start, end))
      })
      .catch((err) => setError(describeAiKeyError(err)))
      .finally(() => setLoading(false))
  }, [apiKeyId, describeAiKeyError])

  return { totals, days, error, loading }
}
