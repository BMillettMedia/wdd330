export function handleError(err) {
  console.error(err);
  const grid = document.getElementById('pokedex-grid');
  if (grid) grid.innerHTML = `<div class="error">Error loading data. Try refreshing.</div>`;
}

export function capitalize(s) {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function debounce(fn, delay = 300) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
}

/**
 * Extract numeric ID from a PokeAPI resource URL (e.g. .../pokemon/25/)
 */
export function extractIdFromUrl(url) {
  try {
    const parts = url.split('/').filter(Boolean);
    return Number(parts[parts.length - 1]);
  } catch {
    return null;
  }
}

/**
 * Compute official artwork URL by id using GitHub raw sprites repository as fallback
 */
export function officialArtworkUrl(id) {
  if (!id) return '';
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}
