// js/modules/favorites.js

export function loadFavorites() {
  const data = localStorage.getItem('favorites');
  return data ? JSON.parse(data) : [];
}

export function saveFavorites(favorites) {
  localStorage.setItem('favorites', JSON.stringify(favorites));
}

export function toggleFavorite(pokemonId) {
  let favorites = loadFavorites();
  if (favorites.includes(pokemonId)) {
    favorites = favorites.filter((id) => id !== pokemonId);
  } else {
    favorites.push(pokemonId);
  }
  saveFavorites(favorites);
  document.dispatchEvent(new Event('favoritesUpdated'));
}

export function isFavorite(pokemonId) {
  return loadFavorites().includes(pokemonId);
}
