import { Button, GoogleIcon, GithubIcon } from '@/shared/ui'
import { useProviderAuth } from '../model/useProviderAuth'
import styles from './ProviderAuthButtons.module.css'

interface ProviderAuthButtonsProps {
  mode: 'login' | 'register'
}

export function ProviderAuthButtons({ mode }: ProviderAuthButtonsProps) {
  const { continueWith, loadingProvider } = useProviderAuth()
  const verb = mode === 'login' ? 'Iniciar sesión' : 'Registrarme'

  return (
    <div className={styles.group}>
      <Button
        variant="secondary"
        fullWidth
        disabled={loadingProvider !== null}
        onClick={() => continueWith('google')}
      >
        <GoogleIcon />
        {loadingProvider === 'google' ? 'Redirigiendo…' : `${verb} con Google`}
      </Button>
      <Button
        variant="secondary"
        fullWidth
        disabled={loadingProvider !== null}
        onClick={() => continueWith('github')}
      >
        <GithubIcon />
        {loadingProvider === 'github' ? 'Redirigiendo…' : `${verb} con GitHub`}
      </Button>
    </div>
  )
}
