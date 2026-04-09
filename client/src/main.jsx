import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth.jsx'
import { ToastProvider } from './components/Toast.jsx'
import App from './App.jsx'
import './index.css'

// Initialise theme before first paint — prevents flash of wrong theme
const saved = localStorage.getItem('rn-theme') || 'dark'
document.documentElement.setAttribute('data-theme', saved)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
