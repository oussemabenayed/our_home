import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n'
import App from './App.jsx'
import { register as registerSW } from './utils/serviceWorker'
import { measurePerformance, preloadCriticalResources, loadNonCriticalResources } from './utils/performance'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Performance optimizations
measurePerformance();
preloadCriticalResources();
loadNonCriticalResources();

// Register service worker for caching
if (import.meta.env.PROD) {
  registerSW();
}
