import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'
import { ToastProvider } from './components/Toast'
import { ThemeProvider } from './components/ThemeProvider'
import './index.css'

// Register Service Worker for PWA (skip on Safari < 16 which has limited SW support)
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
const safariVersion = isSafari ? parseInt((navigator.userAgent.match(/Version\/(\d+)/) || [])[1]) : 99

if ('serviceWorker' in navigator && !(isSafari && safariVersion < 16)) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then((reg) => console.log('SW registered:', reg.scope))
      .catch((err) => console.log('SW registration failed:', err))
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
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
