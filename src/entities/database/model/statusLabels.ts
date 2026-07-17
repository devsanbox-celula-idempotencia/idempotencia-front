const KNOWN_STATUS_LABELS: Record<string, string> = {
  Active: 'Activa',
  Provisioning: 'Aprovisionando',
  Paused: 'Pausada',
  Error: 'Error',
}

export function getDatabaseStatusLabel(status: string): string {
  return KNOWN_STATUS_LABELS[status] ?? status
}
