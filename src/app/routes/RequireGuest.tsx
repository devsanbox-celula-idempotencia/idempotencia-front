import { Navigate, Outlet } from 'react-router-dom'
import { useSession } from '@/entities/user'

export function RequireGuest() {
  const { isAuthenticated } = useSession()
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />
}
