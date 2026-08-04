import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { fadeInUp } from '@/shared/lib/motion'

/** Entrada/salida genérica para el contenido de una página completa. */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div initial={fadeInUp.initial} animate={fadeInUp.animate} exit={fadeInUp.exit}>
      {children}
    </motion.div>
  )
}
