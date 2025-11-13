// js/modules/offline.js

export function initOfflineMode() {
  if (!('serviceWorker' in navigator)) return;

  navigator.serviceWorker
    .register('/service-worker.js')
    .then(() => console.log('🛰 Offline support ready.'))
    .catch((err) => console.warn('Service worker registration failed:', err));
}
