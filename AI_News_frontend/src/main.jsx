import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './theme/main.css'
import App from './App.jsx'
import { AuthModalProvider } from './context/AuthModalContext.jsx'
import { HomeStateProvider } from './context/HomeStateContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthModalProvider>
      <HomeStateProvider>
        <App />
      </HomeStateProvider>
    </AuthModalProvider>
  </StrictMode>,
)
