import { loadPokemonList } from '../modules/api.js';
import { renderPokemonGrid } from '../modules/ui.js';
import { getFromStorage, saveToStorage } from '../modules/storage.js';
import { put as idbPut } from '../modules/idb.js';

export async function initData() {
  const grid = document.getElementById('pokedex-grid');
  grid.innerHTML = '<div class="loading">Loading Pokédex...</div>';

  // Try localStorage first
  const cached = getFromStorage('pokedex_list');
  if (cached && Array.isArray(cached) && cached.length > 0) {
    renderPokemonGrid(cached);
    return;
  }

  try {
    // Fetch full summary list of Pokémon (names + url). Use a generous limit.
    const list = await loadPokemonList(2000, 0);

    // Save minimal list for quick reuse
    saveToStorage('pokedex_list', list);

    // Also store summaries into IDB for offline
    try {
      for (const s of list) {
        await idbPut('summaries', s);
      }
    } catch (e) {
      console.warn('IDB summary put failed', e);
    }

    renderPokemonGrid(list);
  } catch (err) {
    console.error('initData failed', err);
    // try fallback JSON
    try {
      const resp = await fetch('./data/pokedex-fallback.json');
      const fallback = await resp.json();
      renderPokemonGrid(fallback.results || []);
    } catch (e) {
      grid.innerHTML = '<div class="error">Failed to load Pokédex.</div>';
    }
  }
}


//corrected code
export async function loadPokemonPage(page = 1) {
  const limit = 30;
  const offset = (page - 1) * limit;

  document.getElementById("loading").style.display = "block";

  // Try IndexedDB first
  let cached = await getCachedList(offset, limit);
  if (cached && cached.length > 0) {
    renderPokemonList(cached);
    document.getElementById("loading").style.display = "none";
  }

  // Fetch fresh data from API
  try {
    const list = await fetchPokemonList(offset, limit);

    renderPokemonList(list);
    savePokemonList(list, offset);

  } catch (err) {
    console.error("API error:", err);

    if (!cached) {
      document.getElementById("loading").innerText = "Failed to load Pokémon.";
    }
  }

  document.getElementById("loading").style.display = "none";
}