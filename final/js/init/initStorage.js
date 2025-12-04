import { loadFavorites } from '../modules/favorites.js';
import { initOfflineMode } from '../modules/offline.js';

export function initStorage() {
  loadFavorites();
  initOfflineMode();
}
