import { AnimatePresence } from 'framer-motion'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { LandingPage } from '@/pages/landing'
import { LoginPage } from '@/pages/login'
import { RegisterPage } from '@/pages/register'
import { DashboardPage } from '@/pages/dashboard'
import { AiDashboardPage } from '@/pages/dashboard-ai'
import { N8nDashboardPage } from '@/pages/dashboard-n8n'
import { DnsDashboardPage } from '@/pages/dashboard-dns'
import { OAuthCallbackPage } from '@/pages/oauth-callback'
import { PageTransition } from '@/shared/ui'
import { RequireAuth } from './RequireAuth'
import { RequireGuest } from './RequireGuest'
import { DashboardLayout } from './DashboardLayout'

export function AppRouter() {
  const location = useLocation()

  // Cambiar de servicio (bases de datos <-> IA <-> N8N <-> DNS) no debe
  // re-animar ni remontar el layout del dashboard — ese fade lo maneja
  // DashboardLayout con su propio AnimatePresence alrededor del Outlet. Acá
  // arriba solo importa la transición entre secciones de primer nivel.
  const transitionKey = location.pathname.startsWith('/dashboard') ? '/dashboard' : location.pathname

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={transitionKey}>
        <Route path="/oauth/callback" element={<OAuthCallbackPage />} />

        <Route element={<RequireGuest />}>
          <Route
            path="/"
            element={
              <PageTransition>
                <LandingPage />
              </PageTransition>
            }
          />
          <Route
            path="/login"
            element={
              <PageTransition>
                <LoginPage />
              </PageTransition>
            }
          />
          <Route
            path="/register"
            element={
              <PageTransition>
                <RegisterPage />
              </PageTransition>
            }
          />
        </Route>

        <Route element={<RequireAuth />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Navigate to="databases" replace />} />
            <Route path="databases" element={<DashboardPage />} />
            <Route path="ai" element={<AiDashboardPage />} />
            <Route path="n8n" element={<N8nDashboardPage />} />
            <Route path="dns" element={<DnsDashboardPage />} />
          </Route>
        </Route>
      </Routes>
    </AnimatePresence>
  )
}
