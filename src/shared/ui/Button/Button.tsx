import { motion, type HTMLMotionProps } from 'framer-motion'
import type { ReactNode } from 'react'
import styles from './Button.module.css'

interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'ghost'
  fullWidth?: boolean
  children: ReactNode
}

export function Button({
  variant = 'primary',
  fullWidth = false,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  const classes = [styles.btn, styles[variant], fullWidth ? styles.fullWidth : '', className]
    .filter(Boolean)
    .join(' ')

  return (
    <motion.button
      className={classes}
      disabled={disabled}
      whileHover={disabled ? undefined : { scale: 1.02 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      {...rest}
    >
      {children}
    </motion.button>
  )
}
