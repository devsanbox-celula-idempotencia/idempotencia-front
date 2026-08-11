export type AiKeyEffectiveStatus = 'active' | 'expired' | 'revoked'

/**
 * `isActive` solo. Una key puede tener `isActive: true` y aun así no
 * servir si `expiresAt` ya pasó — el gateway no lo calcula por vos, hay que
 * combinar los dos campos (ver la guía del gateway, sección de trampas).
 */
export function computeAiKeyStatus(isActive: boolean, expiresAt: string | null): AiKeyEffectiveStatus {
  if (!isActive) return 'revoked'
  if (expiresAt !== null && new Date(expiresAt).getTime() <= Date.now()) return 'expired'
  return 'active'
}
