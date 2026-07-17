import { useState, type FormEvent } from 'react'
import { ApiError, databaseApi } from '@/shared/api'
import type { DatabaseCredentials, DatabaseEngine } from '@/shared/api'

interface FieldErrors {
  engine?: string
  dbName?: string
}

const DB_NAME_RE = /^[a-zA-Z][a-zA-Z0-9_]*$/

/** Reglas exactas documentadas por backend para POST /databases. */
function validate(values: { engine: DatabaseEngine | null; dbName: string }): FieldErrors {
  const errors: FieldErrors = {}
  const dbName = values.dbName.trim()

  if (!values.engine) errors.engine = 'Falta elegir el motor de base de datos.'

  if (!dbName) errors.dbName = 'Falta rellenar el campo Nombre de la base de datos.'
  else if (dbName.length > 128) errors.dbName = 'El nombre no puede superar los 128 caracteres.'
  else if (!DB_NAME_RE.test(dbName)) {
    errors.dbName = 'El nombre debe empezar con una letra y solo puede contener letras, números y guion bajo.'
  }

  return errors
}

export function useCreateDatabase(onCreated: (credentials: DatabaseCredentials) => void) {
  const [engine, setEngine] = useState<DatabaseEngine | null>(null)
  const [dbName, setDbName] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setGeneralError(null)

    const errors = validate({ engine, dbName })
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setIsSubmitting(true)
    try {
      const credentials = await databaseApi.createDatabase(engine as DatabaseEngine, dbName.trim())
      onCreated(credentials)
    } catch (error) {
      setGeneralError(error instanceof ApiError ? error.message : 'Ocurrió un error inesperado. Intenta de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    engine,
    setEngine,
    dbName,
    setDbName,
    fieldErrors,
    generalError,
    isSubmitting,
    handleSubmit,
  }
}
