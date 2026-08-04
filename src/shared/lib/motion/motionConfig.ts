/**
 * Espejo en JS de los tokens de motion de `shared/config/tokens.css`
 * (`--motion-*`). Si se toca uno, tocar el otro — Framer Motion no puede
 * leer custom properties CSS directamente en sus props de `transition`.
 */
export const MOTION_DURATION = {
  fast: 0.15,
  base: 0.2,
  slow: 0.25,
} as const

export const MOTION_EASE_OUT = [0.16, 1, 0.3, 1] as const
export const MOTION_EASE_IN_OUT = [0.65, 0, 0.35, 1] as const

export const fadeInUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 8 },
}

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}
