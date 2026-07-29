import { useEffect, useState } from 'react'
import { platformStatsApi } from '@/shared/api'
import type { PlatformStats } from '@/entities/platform-stats'

export function usePlatformStats() {
  const [stats, setStats] = useState<PlatformStats | null>(null)

  useEffect(() => {
    let cancelled = false
    platformStatsApi.getPlatformStats().then((result) => {
      if (!cancelled) setStats(result)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return stats
}
