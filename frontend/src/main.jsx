import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'
import { ToastProvider } from './components/Toast'
import { ThemeProvider } from './components/ThemeProvider'
import './index.css'

// Global error handlers to catch Edge-specific issues
window.onerror = function (msg, url, line, col, err) {
  console.error('[Global Error]', msg, 'at', url + ':' + line, err)
}
window.addEventListener('unhandledrejection', function (e) {
  console.error('[Unhandled Promise]', e.reason)
})

// Register Service Worker for PWA
// Skip on Safari < 16 and Edge InPrivate (SW may hang)
function shouldRegisterSW() {
  if (!('serviceWorker' in navigator)) return false
  // Skip Safari < 16
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
  const safariVersion = isSafari
    ? parseInt((navigator.userAgent.match(/Version\/(\d+)/) || [])[1])
    : 99
  if (isSafari && safariVersion < 16) return false
  // Edge InPrivate mode: storage is ephemeral, SW may misbehave
  // Detect via navigator.storage.estimate() or just try-catch
  return true
}

if (shouldRegisterSW()) {
  window.addEventListener('load', () => {
    try {
      const regPromise = navigator.serviceWorker.register('./sw.js')
      // Timeout guard: some Edge configurations hang on SW registration
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('SW registration timeout')), 5000)
      )
      Promise.race([regPromise, timeoutPromise])
        .then((reg) => console.log('SW registered:', reg.scope))
        .catch((err) => console.log('SW registration failed or timed out:', err.message))
    } catch (err) {
      console.log('SW registration exception:', err.message)
    }
  })
}

const rootEl = document.getElementById('root')
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <HashRouter>
        <ErrorBoundary>
          <ThemeProvider>
            <ToastProvider>
              <App />
            </ToastProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </HashRouter>
    </React.StrictMode>
  )
} else {
  console.error('Root element not found')
}
