import { AppProviders } from './providers/AppProviders'
import { AppRouter } from './routes/AppRouter'
import './styles/global.css'

export function App() {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  )
}
