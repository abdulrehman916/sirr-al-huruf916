import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Register / update service worker — forces immediate activation so old cached
// login screens are purged and the latest build is always served.
if ('serviceWorker' in navigator && !import.meta.env.DEV) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((registration) => {
      // Force the browser to check for an updated sw.js on every launch —
      // critical for APK/WebView builds so stale cached service workers are
      // replaced with the latest build immediately.
      registration.update().catch(() => {});
      // If a new SW is waiting, tell it to skip waiting and take over immediately
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New SW installed — force reload to get the latest app
              window.location.reload();
            }
          });
        }
      });
    }).catch(() => {
      // SW registration failed — app still works without it
    });

    // If the controller changes (new SW took over), reload immediately
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)