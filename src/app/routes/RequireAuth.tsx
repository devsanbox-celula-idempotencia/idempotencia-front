import { Navigate, Outlet } from 'react-router-dom'
import { useSession } from '@/entities/user'

export function RequireAuth() {
  const { isAuthenticated } = useSession()
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}
