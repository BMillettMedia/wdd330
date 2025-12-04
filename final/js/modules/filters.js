import { debounce } from './utils.js';
import { renderPokemonGrid } from './ui.js';
import { getFromStorage } from './storage.js';
import { searchAndOpen } from './modal.js';

let allSummaries = [];

export async function setupFilters() {
  const searchInput = document.getElementById('search');
  if (!searchInput) return;

  // load cached list or fallback to storage
  const cached = getFromStorage('pokedex_list', []);
  allSummaries = cached;

  if (!allSummaries || allSummaries.length === 0) {
    // nothing yet; allow initData to populate first
    allSummaries = [];
  }

  // show initial grid if available
  if (allSummaries.length > 0) renderPokemonGrid(allSummaries);

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
    if (q.length < 2) return; // wait for 2+ chars
    const filtered = allSummaries.filter(p => p.name.includes(q));
    if (filtered.length > 0) {
      renderPokemonGrid(filtered);
    } else {
      // if no local summary match, try exact fetch via modal
      try {
        await searchAndOpen(q);
      } catch {
        const grid = document.getElementById('pokedex-grid');
        grid.innerHTML = `<div class="empty">No Pokémon found for "${q}".</div>`;
      }
    }
  }, 200);

  searchInput.addEventListener('input', debounced);
}
