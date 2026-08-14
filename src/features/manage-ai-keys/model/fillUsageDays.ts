import type { AiUsageDay } from '@/shared/api'

/**
 * El gateway solo manda los días con consumo — sin rellenar los huecos, el
 * detalle diario salta fechas. `start`/`end` son `YYYY-MM-DD`, ambos
 * inclusive; se recorren en UTC porque así es como ya vienen los `day`.
 */
export function fillUsageDays(days: AiUsageDay[], start: string, end: string): AiUsageDay[] {
  const byDay = new Map(days.map((day) => [day.day, day]))
  const zeroDay = (day: string): AiUsageDay => ({ day, requests: 0, promptTokens: 0, completionTokens: 0, totalTokens: 0 })

  const result: AiUsageDay[] = []
  const cursor = new Date(`${start}T00:00:00Z`)
  const endDate = new Date(`${end}T00:00:00Z`)

  while (cursor.getTime() <= endDate.getTime()) {
    const key = cursor.toISOString().slice(0, 10)
    result.push(byDay.get(key) ?? zeroDay(key))
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }

  return result
}
