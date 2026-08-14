const relativeFormatter = new Intl.RelativeTimeFormat('es-CO', { numeric: 'auto' })

const UNITS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ['year', 60 * 60 * 24 * 365],
  ['month', 60 * 60 * 24 * 30],
  ['day', 60 * 60 * 24],
  ['hour', 60 * 60],
  ['minute', 60],
]

/** "hace 3 días". Cae a "hace un momento" para diferencias menores a un minuto. */
export function formatRelativeDate(iso: string): string {
  const diffSeconds = (new Date(iso).getTime() - Date.now()) / 1000

  for (const [unit, secondsInUnit] of UNITS) {
    if (Math.abs(diffSeconds) >= secondsInUnit) {
      return relativeFormatter.format(Math.round(diffSeconds / secondsInUnit), unit)
    }
  }
  return 'hace un momento'
}
