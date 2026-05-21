import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import './styles/theme.css'
import App from './App.jsx'
import AgentsLayout from './agents/AgentsLayout.jsx'
import OpsApp from './ops/OpsApp.jsx'
import ConsoleApp from './console/ConsoleApp.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/ops/*" element={<OpsApp />} />
        <Route path="/console/*" element={<ConsoleApp />} />
        <Route path="/agents" element={<Navigate to="/agents/lead-finder" replace />} />
        <Route path="/agents/:agentId" element={<AgentsLayout />} />
        <Route path="/*" element={<App />} />
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
