import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@/app/App'
import { AI_GATEWAY_BASE_URL } from '@/shared/api'

/**
 * Vite hornea las variables VITE_* en el bundle en build time, no en
 * runtime — si el pipeline de despliegue no las define, el build igual
 * "funciona" pero queda apuntando a donde sea que caiga el fallback (o a
 * nada). Este log es la diferencia entre depurar eso mirando la consola en
 * 10 segundos o persiguiendo un 404 que parece del backend durante días.
 */
if (import.meta.env.DEV || import.meta.env.VITE_DEBUG_URLS) {
  console.info('[IA] gateway =', AI_GATEWAY_BASE_URL || '(SIN DEFINIR)')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
