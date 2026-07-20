import { delay } from './mock/delay'
import { computePlatformStats } from './mock/mockStore'
import type { PlatformStats } from './types'

export async function getPlatformStats(): Promise<PlatformStats> {
  await delay(300)
  return computePlatformStats()
}
