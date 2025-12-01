import { loadFavorites } from '../modules/favorites.js';
import { initOfflineMode } from '../modules/offline.js';

export function initStorage() {
  loadFavorites();
  initOfflineMode();

  // register service worker if supported
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => console.log('ServiceWorker registered', reg.scope))
      .catch(err => console.warn('SW register failed', err));
  }
}
