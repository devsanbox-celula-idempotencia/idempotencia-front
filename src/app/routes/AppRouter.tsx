import { AnimatePresence } from 'framer-motion'
import { Route, Routes, useLocation } from 'react-router-dom'
import { LandingPage } from '@/pages/landing'
import { LoginPage } from '@/pages/login'
import { RegisterPage } from '@/pages/register'
import { DashboardPage } from '@/pages/dashboard'
import { OAuthCallbackPage } from '@/pages/oauth-callback'
import { PageTransition } from '@/shared/ui'
import { RequireAuth } from './RequireAuth'
import { RequireGuest } from './RequireGuest'

export function AppRouter() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
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
          <Route
            path="/dashboard"
            element={
              <PageTransition>
                <DashboardPage />
              </PageTransition>
            }
          />
        </Route>
      </Routes>
    </AnimatePresence>
  )
}
