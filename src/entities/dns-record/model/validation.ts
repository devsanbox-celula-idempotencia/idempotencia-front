/**
 * Mismo patrón que valida el backend: 3–63 caracteres, letras/números/guiones,
 * sin guion al principio ni al final, sin puntos. Deliberadamente NO se valida
 * acá: nombres reservados, si el nombre ya está tomado, ni si la IP es privada
 * — esas listas viven en el servidor y duplicarlas garantiza que queden viejas.
 */
const LABEL_RE = /^[a-z0-9]([a-z0-9-]{1,61}[a-z0-9])$/

export function validateDnsLabel(label: string): string | null {
  const value = label.trim().toLowerCase()
  if (!value) return 'Elegí un nombre para tu subdominio.'
  if (value.length < 3) return 'El nombre debe tener al menos 3 caracteres.'
  if (value.length > 63) return 'El nombre no puede superar los 63 caracteres.'
  if (value.includes('.')) return 'El nombre no puede contener puntos.'
  if (!LABEL_RE.test(value)) return 'Solo letras, números y guiones. No puede empezar ni terminar con guion.'
  return null
}

const IPV4_RE = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/

export function validateIpAddress(ip: string): string | null {
  const match = ip.trim().match(IPV4_RE)
  if (!match) return 'Escribí una dirección IPv4, por ejemplo 203.0.113.10'
  if (match.slice(1).some((octet) => Number(octet) > 255)) return 'Cada número debe estar entre 0 y 255.'
  return null
}
