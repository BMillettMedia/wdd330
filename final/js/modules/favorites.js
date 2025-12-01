import { getFromStorage, saveToStorage } from './storage.js';

export function loadFavorites() {
  return getFromStorage('pokedex_favorites', []);
}

export function saveFavorites(list) {
  saveToStorage('pokedex_favorites', list);
}

export function toggleFavorite(pokemonId) {
  const cur = loadFavorites();
  let updated;
  if (cur.includes(pokemonId)) {
    updated = cur.filter(id => id !== pokemonId);
  } else {
    updated = [...cur, pokemonId];
  }
  saveFavorites(updated);
  document.dispatchEvent(new Event('favoritesUpdated'));
}

export function isFavorite(pokemonId) {
  const cur = loadFavorites();
  return cur.includes(pokemonId);
}
