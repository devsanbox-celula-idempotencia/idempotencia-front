import { useSession } from '@/entities/user'
import { Button } from '@/shared/ui'

export function LogoutButton() {
  const { clearSession } = useSession()

  return (
    <Button variant="ghost" onClick={clearSession}>
      Cerrar sesión
    </Button>
  )
}
