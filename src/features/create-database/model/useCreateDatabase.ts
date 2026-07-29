import { useState, type FormEvent } from 'react'
import { ApiError, databaseApi } from '@/shared/api'
import type { DatabaseCredentials, DatabaseEngine } from '@/shared/api'

interface FieldErrors {
  engine?: string
  dbName?: string
  maxConcurrentConnections?: string
}

const DB_NAME_RE = /^[a-zA-Z][a-zA-Z0-9_]*$/

/** Motores donde `maxConcurrentConnections` tiene efecto real (ver guía de integración, sección 4). */
export const ENGINES_WITH_CONNECTION_LIMIT: DatabaseEngine[] = ['MySql', 'Postgres']

/** Reglas exactas documentadas por backend para POST /databases. */
function validate(values: {
  engine: DatabaseEngine | null
  dbName: string
  maxConcurrentConnections: string
}): FieldErrors {
  const errors: FieldErrors = {}
  const dbName = values.dbName.trim()

  if (!values.engine) errors.engine = 'Falta elegir el motor de base de datos.'

  if (!dbName) errors.dbName = 'Falta rellenar el campo Nombre de la base de datos.'
  else if (dbName.length > 128) errors.dbName = 'El nombre no puede superar los 128 caracteres.'
  else if (!DB_NAME_RE.test(dbName)) {
    errors.dbName = 'El nombre debe empezar con una letra y solo puede contener letras, números y guion bajo.'
  }

  if (values.maxConcurrentConnections) {
    const parsed = Number(values.maxConcurrentConnections)
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 100) {
      errors.maxConcurrentConnections = 'Debe ser un número entero entre 1 y 100.'
    }
  }

  return errors
}

export function useCreateDatabase(onCreated: (credentials: DatabaseCredentials) => void) {
  const [engine, setEngine] = useState<DatabaseEngine | null>(null)
  const [dbName, setDbName] = useState('')
  const [maxConcurrentConnections, setMaxConcurrentConnections] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setGeneralError(null)

    const errors = validate({ engine, dbName, maxConcurrentConnections })
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setIsSubmitting(true)
    try {
      const credentials = await databaseApi.createDatabase(
        engine as DatabaseEngine,
        dbName.trim(),
        maxConcurrentConnections ? Number(maxConcurrentConnections) : undefined,
      )
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
    maxConcurrentConnections,
    setMaxConcurrentConnections,
    fieldErrors,
    generalError,
    isSubmitting,
    handleSubmit,
  }
}
