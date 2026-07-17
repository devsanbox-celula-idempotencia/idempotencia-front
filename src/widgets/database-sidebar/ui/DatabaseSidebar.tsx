import type { DatabaseRecord } from '@/entities/database'
import { StatusBadge } from '@/entities/database'
import { Button } from '@/shared/ui'
import styles from './DatabaseSidebar.module.css'

interface DatabaseSidebarProps {
  databases: DatabaseRecord[]
  selectedId: number | null
  onSelect: (id: number) => void
  onCreateClick: () => void
  isCreating: boolean
}

export function DatabaseSidebar({ databases, selectedId, onSelect, onCreateClick, isCreating }: DatabaseSidebarProps) {
  return (
    <aside className={styles.sidebar}>
      <Button type="button" fullWidth onClick={onCreateClick} disabled={isCreating}>
        + Crear base de datos
      </Button>

      <h2 className={styles.heading}>Tus bases de datos</h2>
      {databases.length === 0 ? (
        <p className={styles.empty}>Aún no tienes bases de datos.</p>
      ) : (
        <div className={styles.list}>
          {databases.map((database) => (
            <button
              key={database.databaseId}
              type="button"
              className={`${styles.row} ${!isCreating && database.databaseId === selectedId ? styles.rowSelected : ''}`}
              onClick={() => onSelect(database.databaseId)}
            >
              <span className={styles.rowName}>{database.dbName}</span>
              <StatusBadge status={database.status} />
            </button>
          ))}
        </div>
      )}
    </aside>
  )
}
