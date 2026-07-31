import type { ReactNode } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { SessionProvider } from '@/entities/user'
import { ThemeProvider } from '@/shared/lib/theme'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <SessionProvider>{children}</SessionProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}
