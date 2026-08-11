import { useEffect, useState, type FormEvent } from 'react'
import { AiGatewayError, aiApi } from '@/shared/api'
import type { AiApiKey, AiApiKeyCredentials } from '@/shared/api'
import { useAiKeyErrorHandler } from './useAiKeyErrorHandler'

export function useManageAiKeys() {
  const describeAiKeyError = useAiKeyErrorHandler()

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
        setListError(describeAiKeyError(error))
        setKeys((prev) => prev ?? [])
      })
  }

  useEffect(() => {
    loadKeys()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      setCreateError(describeAiKeyError(error))
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
      setRevokeError(describeAiKeyError(error))
      // Una clave ajena o ya borrada también da 404 (a propósito, no se puede distinguir) —
      // en ambos casos lo correcto es refrescar: si ya no está, desaparece de la lista sola.
      if (error instanceof AiGatewayError && error.code === 'not_found') {
        setPendingRevokeId(null)
        loadKeys()
      }
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
