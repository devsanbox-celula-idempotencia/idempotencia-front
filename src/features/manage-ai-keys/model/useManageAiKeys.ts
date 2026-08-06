import { useEffect, useState, type FormEvent } from 'react'
import { ApiError, aiApi } from '@/shared/api'
import type { AiApiKey, AiApiKeyCredentials } from '@/shared/api'

function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : 'Ocurrió un error inesperado. Intenta de nuevo.'
}

export function useManageAiKeys() {
  const [keys, setKeys] = useState<AiApiKey[] | null>(null)
  const [listError, setListError] = useState<string | null>(null)

  const [justCreated, setJustCreated] = useState<AiApiKeyCredentials | null>(null)
  const [nameInput, setNameInput] = useState('')
  const [createError, setCreateError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const [pendingRevokeId, setPendingRevokeId] = useState<number | null>(null)
  const [revokeError, setRevokeError] = useState<string | null>(null)
  const [isRevoking, setIsRevoking] = useState(false)

  function loadKeys() {
    setListError(null)
    aiApi
      .getMyAiApiKeys()
      .then(setKeys)
      .catch((error) => {
        setListError(errorMessage(error))
        setKeys((prev) => prev ?? [])
      })
  }

  useEffect(() => {
    loadKeys()
  }, [])

  async function handleCreate(event: FormEvent) {
    event.preventDefault()
    const name = nameInput.trim()
    if (!name) {
      setCreateError('Falta rellenar el campo Nombre.')
      return
    }
    setCreateError(null)
    setIsCreating(true)
    try {
      const credentials = await aiApi.createAiApiKey(name)
      setJustCreated(credentials)
      setNameInput('')
      loadKeys()
    } catch (error) {
      setCreateError(errorMessage(error))
    } finally {
      setIsCreating(false)
    }
  }

  function dismissJustCreated() {
    setJustCreated(null)
  }

  function requestRevoke(id: number) {
    setRevokeError(null)
    setPendingRevokeId(id)
  }

  function cancelRevoke() {
    if (isRevoking) return
    setPendingRevokeId(null)
    setRevokeError(null)
  }

  async function confirmRevoke() {
    if (pendingRevokeId === null) return
    setIsRevoking(true)
    setRevokeError(null)
    try {
      await aiApi.revokeAiApiKey(pendingRevokeId)
      setPendingRevokeId(null)
      loadKeys()
    } catch (error) {
      setRevokeError(errorMessage(error))
    } finally {
      setIsRevoking(false)
    }
  }

  return {
    keys,
    listError,
    reloadKeys: loadKeys,
    justCreated,
    dismissJustCreated,
    nameInput,
    setNameInput,
    createError,
    isCreating,
    handleCreate,
    pendingRevokeId,
    revokeError,
    isRevoking,
    requestRevoke,
    cancelRevoke,
    confirmRevoke,
  }
}
