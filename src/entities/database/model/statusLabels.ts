import type { DatabaseStatus } from '@/shared/api'

export const DATABASE_STATUS_LABELS: Record<DatabaseStatus, string> = {
  active: 'Activa',
  provisioning: 'Aprovisionando',
  suspended: 'Pausada',
  error: 'Error',
}
