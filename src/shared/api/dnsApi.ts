import { apiFetch } from './httpClient'
import type { CreateDnsRecordRequest, DnsRecord, DnsZone } from './types'

/** GET /dns/zone — dominio y patrón. Traer siempre de acá, nunca hardcodear: cambia entre ambientes. */
export async function getDnsZone(): Promise<DnsZone> {
  return apiFetch<DnsZone>('/dns/zone')
}

/** GET /dns — solo los vivos del usuario, del más reciente al más viejo. */
export async function getMyDnsRecords(): Promise<DnsRecord[]> {
  return apiFetch<DnsRecord[]>('/dns')
}

/** POST /dns — `cell` se omite a propósito: el backend usa "idempotencia" por defecto. */
export async function createDnsRecord(data: CreateDnsRecordRequest): Promise<DnsRecord> {
  return apiFetch<DnsRecord>('/dns', { method: 'POST', body: JSON.stringify(data) })
}

/** PUT /dns/{id} — lo único editable es la IP; el nombre no (hay que eliminar y crear otro). */
export async function updateDnsRecordIp(id: number, ipAddress: string): Promise<DnsRecord> {
  return apiFetch<DnsRecord>(`/dns/${id}`, { method: 'PUT', body: JSON.stringify({ ipAddress }) })
}

/** DELETE /dns/{id} — 204. El nombre queda libre de inmediato para cualquiera. */
export async function deleteDnsRecord(id: number): Promise<void> {
  await apiFetch<void>(`/dns/${id}`, { method: 'DELETE' })
}
