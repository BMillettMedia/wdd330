import { debounce } from './utils.js';
import { loadPokemonList } from './api.js';
import { renderPokemonGrid, searchAndOpen } from './ui.js';
import { saveToStorage, getFromStorage } from './storage.js';

let allSummaries = [];

export async function setupFilters() {
  const searchInput = document.getElementById('search');
  if (!searchInput) return;

  const cached = getFromStorage('pokedex_list');
  if (cached && cached.length) allSummaries = cached;
  else {
    allSummaries = await loadPokemonList(151);
    saveToStorage('pokedex_list', allSummaries);
  }

  renderPokemonGrid(allSummaries);

  searchInput.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
      const q = searchInput.value.trim();
      if (!q) return;
      await searchAndOpen(q);
    }
  });

  const debounced = debounce(async () => {
    const q = searchInput.value.trim().toLowerCase();
    if (!q) {
      renderPokemonGrid(allSummaries);
      return;
    }
    if (q.length < 3) return;
    const filtered = allSummaries.filter(p => p.name.includes(q));
    if (filtered.length > 0) renderPokemonGrid(filtered);
    else {
      try { await searchAndOpen(q); } catch {
        const grid = document.getElementById('pokedex-grid');
        grid.innerHTML = `<div class="empty">No Pokémon found for "${q}".</div>`;
      }
    }
  }, 250);

  searchInput.addEventListener('input', debounced);
}
