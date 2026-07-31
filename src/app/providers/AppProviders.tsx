import type { ReactNode } from 'react'
import { MotionConfig } from 'framer-motion'
import { BrowserRouter } from 'react-router-dom'
import { SessionProvider } from '@/entities/user'
import { ThemeProvider } from '@/shared/lib/theme'
import { MOTION_DURATION, MOTION_EASE_OUT } from '@/shared/lib/motion'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      {/* reducedMotion="user" respeta prefers-reduced-motion del sistema para
          TODA animación de Framer Motion en el árbol, sin chequearlo a mano
          en cada componente. Transición por defecto: 200ms, ease-out. */}
      <MotionConfig reducedMotion="user" transition={{ duration: MOTION_DURATION.base, ease: MOTION_EASE_OUT }}>
        <BrowserRouter>
          <SessionProvider>{children}</SessionProvider>
        </BrowserRouter>
      </MotionConfig>
    </ThemeProvider>
  )
}
