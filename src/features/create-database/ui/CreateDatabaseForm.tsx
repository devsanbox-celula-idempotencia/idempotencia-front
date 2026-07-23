import { Button, Input } from '@/shared/ui'
import type { DatabaseCredentials, DatabaseEngine } from '@/shared/api'
import { useCreateDatabase } from '../model/useCreateDatabase'
import styles from './CreateDatabaseForm.module.css'

interface EngineOption {
  engine: DatabaseEngine
  label: string
  description: string
}

// Los 4 motores tienen provisioner real en el backend (SqlServer, Postgres,
// MySql, Mongo) — ver guía de integración de /databases.
const ENGINE_OPTIONS: EngineOption[] = [
  { engine: 'SqlServer', label: 'SQL Server', description: 'Motor relacional de Microsoft.' },
  { engine: 'Postgres', label: 'PostgreSQL', description: 'Motor relacional open source.' },
  { engine: 'MySql', label: 'MySQL', description: 'Motor relacional open source.' },
  { engine: 'Mongo', label: 'MongoDB', description: 'Base de datos NoSQL orientada a documentos.' },
]

interface CreateDatabaseFormProps {
  onCreated: (credentials: DatabaseCredentials) => void
  onCancel: () => void
}

export function CreateDatabaseForm({ onCreated, onCancel }: CreateDatabaseFormProps) {
  const { engine, setEngine, dbName, setDbName, fieldErrors, generalError, isSubmitting, handleSubmit } =
    useCreateDatabase(onCreated)

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div>
        <h2 className={styles.title}>Crear base de datos</h2>
        <p className={styles.subtitle}>Elige el motor y ponle un nombre a tu base de datos.</p>
      </div>

      <div className={styles.engineGrid}>
        {ENGINE_OPTIONS.map((option) => (
          <button
            key={option.engine}
            type="button"
            className={`${styles.engineCard} ${engine === option.engine ? styles.engineCardSelected : ''}`}
            onClick={() => setEngine(option.engine)}
          >
            <span className={styles.engineLabel}>{option.label}</span>
            <span className={styles.engineDescription}>{option.description}</span>
          </button>
        ))}
      </div>
      {fieldErrors.engine && <p className={styles.fieldError}>{fieldErrors.engine}</p>}

      <Input
        label="Nombre de la base de datos"
        name="dbName"
        maxLength={128}
        value={dbName}
        onChange={(e) => setDbName(e.target.value)}
        error={fieldErrors.dbName}
      />

      {generalError && <p className={styles.generalError}>{generalError}</p>}

      <div className={styles.actions}>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creando…' : 'Crear base de datos'}
        </Button>
      </div>
    </form>
  )
}
