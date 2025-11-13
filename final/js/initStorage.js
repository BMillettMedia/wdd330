import { loadFavorites } from './modules/favorites.js';
import { initOfflineMode } from './modules/offline.js';

export function initStorage() {
  console.log('💾 Initializing storage and offline mode...');
  loadFavorites();
  initOfflineMode();
}
