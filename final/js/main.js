import { loadAll } from './api.js';
import { renderList } from './render.js';
import { enableSearch } from './search.js';

import { loadPokedexData } from './data/loadDex.js';
import { renderTable } from './ui/renderTable.js';


async function init() {
  const status = document.getElementById('status');
  status.textContent = 'Loading Pokédex from API (fallback: local JSON)...';

  // load list (API with fallback)
  const all = await loadAll();

  // render default full list
  renderList(all);

  // enable search with local filtering and API fallback
  enableSearch(all);
}

init();


//local Pokedex load
async function init() {
  try {
    const data = await loadPokedexData();
    renderTable(data);
  } catch (err) {
    console.error('Failed to initialize app:', err);
  }
}

init();