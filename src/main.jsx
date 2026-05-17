import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import AgentsLayout from './agents/AgentsLayout.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/agents" element={<Navigate to="/agents/lead-finder" replace />} />
        <Route path="/agents/:agentId" element={<AgentsLayout />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)

const splash = document.getElementById('splash')
if (splash) {
  setTimeout(() => {
    splash.style.opacity = '0'
    setTimeout(() => splash.remove(), 500)
  }, 900)
}
