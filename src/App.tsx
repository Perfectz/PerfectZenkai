import { useRoutes } from 'react-router-dom'
import { appRoutes } from './app/routes'

function App() {
  const element = useRoutes(appRoutes)
  return element
}

export default App 