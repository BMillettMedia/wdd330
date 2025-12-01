import { loadPokemonList } from '../modules/api.js';
import { renderPokemonGrid } from '../modules/ui.js';
import { getFromStorage, saveToStorage } from '../modules/storage.js';

export async function initData() {
  const cached = getFromStorage('pokedex_list');
  if (cached && Array.isArray(cached) && cached.length > 0) {
    renderPokemonGrid(cached, { fromList: true });
    return;
  }

  try {
    const list = await loadPokemonList(151, 0);
    renderPokemonGrid(list, { fromList: true });
    saveToStorage('pokedex_list', list);
  } catch (err) {
    console.error('initData error', err);
  }
}
