import type { PlatformStats } from '@/entities/platform-stats'
import { usePlatformStats } from '../model/usePlatformStats'
import styles from './PlatformStatsGrid.module.css'

const compactNumber = new Intl.NumberFormat('es-CO', { notation: 'compact', maximumFractionDigits: 1 })

interface Tile {
  label: string
  value: string
  showStatusDot?: boolean
}

function buildTiles(stats: PlatformStats): Tile[] {
  return [
    { label: 'Usuarios registrados', value: compactNumber.format(stats.totalUsers) },
    { label: 'Bases de datos creadas', value: compactNumber.format(stats.totalDatabases) },
    { label: 'Bases de datos activas', value: compactNumber.format(stats.activeDatabases) },
    { label: 'Inicios de sesión', value: compactNumber.format(stats.totalLogins) },
    { label: 'Usuarios activos', value: compactNumber.format(stats.activeUsers) },
    {
      label: 'Disponibilidad del servicio',
      value: `${stats.uptimePercentage.toFixed(2)}%`,
      showStatusDot: true,
    },
  ]
}

const TILE_LABELS = [
  'Usuarios registrados',
  'Bases de datos creadas',
  'Bases de datos activas',
  'Inicios de sesión',
  'Usuarios activos',
  'Disponibilidad del servicio',
]

export function PlatformStatsGrid() {
  const stats = usePlatformStats()

  if (!stats) {
    return (
      <div className={styles.grid}>
        {TILE_LABELS.map((label) => (
          <div key={label} className={`${styles.tile} ${styles.skeleton}`}>
            <span className={styles.label}>{label}</span>
            <span className={styles.valueRow}>
              <span className={styles.value}>—</span>
            </span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={styles.grid}>
      {buildTiles(stats).map((tile) => (
        <div key={tile.label} className={styles.tile}>
          <span className={styles.label}>{tile.label}</span>
          <span className={styles.valueRow}>
            {tile.showStatusDot && <span className={styles.dot} />}
            <span className={styles.value}>{tile.value}</span>
          </span>
        </div>
      ))}
    </div>
  )
}
