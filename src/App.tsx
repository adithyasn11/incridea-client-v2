import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes.tsx'

import { SocketProvider } from './context/SocketContext'
import TargetCursor from './components/TargetCursor'

function App() {
  return (
    <BrowserRouter>
      <SocketProvider>
        <TargetCursor
            spinDuration={2.8}
            hoverDuration={0.7}
        />
        <AppRoutes />
      </SocketProvider>
    </BrowserRouter>
  )
}

export default App
