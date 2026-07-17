import { Route, Routes } from 'react-router-dom'
import { LandingPage } from '@/pages/landing'
import { LoginPage } from '@/pages/login'
import { RegisterPage } from '@/pages/register'
import { WelcomePage } from '@/pages/welcome'
import { DashboardPage } from '@/pages/dashboard'
import { OAuthCallbackPage } from '@/pages/oauth-callback'
import { RequireAuth } from './RequireAuth'
import { RequireGuest } from './RequireGuest'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/oauth/callback" element={<OAuthCallbackPage />} />

      <Route element={<RequireGuest />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<RequireAuth />}>
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Route>
    </Routes>
  )
}
