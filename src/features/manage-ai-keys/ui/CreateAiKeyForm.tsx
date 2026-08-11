import type { FormEvent } from 'react'
import { Button, Input } from '@/shared/ui'
import styles from './CreateAiKeyForm.module.css'

interface CreateAiKeyFormProps {
  nameInput: string
  setNameInput: (value: string) => void
  createError: string | null
  isCreating: boolean
  onSubmit: (event: FormEvent) => void
}

export function CreateAiKeyForm({ nameInput, setNameInput, createError, isCreating, onSubmit }: CreateAiKeyFormProps) {
  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <div>
        <h2 className={styles.title}>Nueva API-Key</h2>
        <p className={styles.subtitle}>Ponle un nombre que te ayude a identificarla (ej. el proyecto que la va a usar).</p>
      </div>
      <div className={styles.row}>
        <Input
          label="Nombre"
          name="aiKeyName"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          error={createError ?? undefined}
        />
        <Button type="submit" disabled={isCreating}>
          {isCreating ? 'Creando…' : '+ Crear API-Key'}
        </Button>
      </div>
    </form>
  )
}
