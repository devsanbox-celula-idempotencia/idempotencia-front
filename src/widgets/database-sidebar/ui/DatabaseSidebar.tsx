import type { DatabaseRecord } from '@/entities/database'
import { StatusBadge } from '@/entities/database'
import styles from './DatabaseSidebar.module.css'

interface DatabaseSidebarProps {
  databases: DatabaseRecord[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function DatabaseSidebar({ databases, selectedId, onSelect }: DatabaseSidebarProps) {
  return (
    <aside className={styles.sidebar}>
      <h2 className={styles.heading}>Tus bases de datos</h2>
      <div className={styles.list}>
        {databases.map((database) => (
          <button
            key={database.id}
            type="button"
            className={`${styles.row} ${database.id === selectedId ? styles.rowSelected : ''}`}
            onClick={() => onSelect(database.id)}
          >
            <span className={styles.rowHost}>{database.host}</span>
            <StatusBadge status={database.status} />
          </button>
        ))}
      </div>
    </aside>
  )
}
