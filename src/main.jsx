import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

const splash = document.getElementById('splash')
if (splash) {
  setTimeout(() => {
    splash.style.opacity = '0'
    setTimeout(() => splash.remove(), 500)
  }, 900)
}
