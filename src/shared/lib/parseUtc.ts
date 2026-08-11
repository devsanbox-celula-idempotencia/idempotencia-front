/**
 * El gateway de IA manda timestamps en UTC pero sin sufijo `Z` (ej.
 * `"2026-08-11T20:53:11.122305"`) — sin él, JS los lee como hora local y una
 * clave recién creada aparece creada en el futuro. Detecta si ya trae zona
 * (`Z` o `+hh:mm`/`-hh:mm`) antes de agregarla, para no romper fechas que sí
 * vengan completas (ej. `expiresAt` si el front la construye con `toISOString()`).
 *
 * Ojo: los campos de solo fecha (`"YYYY-MM-DD"`, ej. `usage.days[].day`) NO
 * deben pasar por acá — esos sí los lee bien como UTC tal cual vienen, y
 * aplicarles esta corrección los desplaza un día.
 */
export function parseUtc(value: string): Date
export function parseUtc(value: string | null): Date | null
export function parseUtc(value: string | null): Date | null {
  if (value === null) return null
  const hasZone = /[Z+]|-\d{2}:\d{2}$/.test(value)
  return new Date(hasZone ? value : `${value}Z`)
}
