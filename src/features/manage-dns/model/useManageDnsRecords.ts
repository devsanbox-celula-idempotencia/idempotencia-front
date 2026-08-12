import { useEffect, useState, type FormEvent } from 'react'
import { ApiError, dnsApi } from '@/shared/api'
import type { DnsRecord } from '@/shared/api'
import { validateDnsLabel, validateIpAddress } from '@/entities/dns-record'

export const DNS_QUOTA = 5

function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : 'Ocurrió un error inesperado. Intenta de nuevo.'
}

export function useManageDnsRecords() {
  const [records, setRecords] = useState<DnsRecord[] | null>(null)
  const [listError, setListError] = useState<string | null>(null)

  const [justCreated, setJustCreated] = useState<DnsRecord | null>(null)
  const [labelInput, setLabelInput] = useState('')
  const [ipInput, setIpInput] = useState('')
  const [createError, setCreateError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [nameSuggestion, setNameSuggestion] = useState<string | null>(null)
  const [cooldownSeconds, setCooldownSeconds] = useState(0)

  const [pendingReassignId, setPendingReassignId] = useState<number | null>(null)
  const [reassignIpInput, setReassignIpInput] = useState('')
  const [reassignError, setReassignError] = useState<string | null>(null)
  const [isReassigning, setIsReassigning] = useState(false)

  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  function loadRecords() {
    setListError(null)
    dnsApi
      .getMyDnsRecords()
      .then(setRecords)
      .catch((error) => {
        setListError(errorMessage(error))
        setRecords((prev) => prev ?? [])
      })
  }

  useEffect(() => {
    loadRecords()
  }, [])

  // Cooldown del 429: se autodecrementa cada segundo hasta llegar a 0.
  useEffect(() => {
    if (cooldownSeconds <= 0) return
    const timer = setTimeout(() => setCooldownSeconds((seconds) => seconds - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldownSeconds])

  const quotaReached = records !== null && records.length >= DNS_QUOTA

  async function handleCreate(event: FormEvent) {
    event.preventDefault()
    if (cooldownSeconds > 0 || quotaReached) return

    const label = labelInput.trim().toLowerCase()
    const ip = ipInput.trim()
    const labelError = validateDnsLabel(label)
    const ipError = validateIpAddress(ip)
    if (labelError || ipError) {
      setCreateError(labelError ?? ipError)
      return
    }

    setCreateError(null)
    setNameSuggestion(null)
    setIsCreating(true)
    try {
      const record = await dnsApi.createDnsRecord({ label, ipAddress: ip })
      setJustCreated(record)
      setLabelInput('')
      setIpInput('')
      loadRecords()
    } catch (error) {
      setCreateError(errorMessage(error))
      if (error instanceof ApiError) {
        // 409: el nombre ya está tomado — sugerir una variante determinística, no adivinar disponibilidad.
        if (error.status === 409) setNameSuggestion(`${label}-2`)
        if (error.status === 429 && error.retryAfter) setCooldownSeconds(error.retryAfter)
      }
    } finally {
      setIsCreating(false)
    }
  }

  function dismissJustCreated() {
    setJustCreated(null)
  }

  function requestReassign(id: number, currentIp: string) {
    setReassignError(null)
    setReassignIpInput(currentIp)
    setPendingReassignId(id)
  }

  function cancelReassign() {
    if (isReassigning) return
    setPendingReassignId(null)
    setReassignError(null)
  }

  async function confirmReassign() {
    if (pendingReassignId === null) return
    const ipError = validateIpAddress(reassignIpInput)
    if (ipError) {
      setReassignError(ipError)
      return
    }
    setIsReassigning(true)
    setReassignError(null)
    try {
      await dnsApi.updateDnsRecordIp(pendingReassignId, reassignIpInput.trim())
      setPendingReassignId(null)
      loadRecords()
    } catch (error) {
      setReassignError(errorMessage(error))
      if (error instanceof ApiError && error.status === 429 && error.retryAfter) setCooldownSeconds(error.retryAfter)
    } finally {
      setIsReassigning(false)
    }
  }

  function requestDelete(id: number) {
    setDeleteError(null)
    setPendingDeleteId(id)
  }

  function cancelDelete() {
    if (isDeleting) return
    setPendingDeleteId(null)
    setDeleteError(null)
  }

  async function confirmDelete() {
    if (pendingDeleteId === null) return
    setIsDeleting(true)
    setDeleteError(null)
    try {
      await dnsApi.deleteDnsRecord(pendingDeleteId)
      setPendingDeleteId(null)
      loadRecords()
    } catch (error) {
      setDeleteError(errorMessage(error))
    } finally {
      setIsDeleting(false)
    }
  }

  return {
    records,
    listError,
    reloadRecords: loadRecords,
    quotaReached,

    justCreated,
    dismissJustCreated,
    labelInput,
    setLabelInput,
    ipInput,
    setIpInput,
    createError,
    isCreating,
    handleCreate,
    nameSuggestion,
    cooldownSeconds,

    pendingReassignId,
    reassignIpInput,
    setReassignIpInput,
    reassignError,
    isReassigning,
    requestReassign,
    cancelReassign,
    confirmReassign,

    pendingDeleteId,
    deleteError,
    isDeleting,
    requestDelete,
    cancelDelete,
    confirmDelete,
  }
}
