import { useEffect, useRef, useState } from 'react'
import { copyToClipboard } from './copyToClipboard'

export type CopyState = 'idle' | 'success' | 'error'

/** Estado único para todos los botones de copiar — un solo lugar donde el intento puede fallar y avisarlo. */
export function useCopyToClipboard(resetDelayMs = 1500) {
  const [state, setState] = useState<CopyState>('idle')
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => () => clearTimeout(timeoutRef.current), [])

  async function copy(text: string) {
    const success = await copyToClipboard(text)
    setState(success ? 'success' : 'error')
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setState('idle'), resetDelayMs)
  }

  return { state, copy }
}
