import { loadPokedexData } from './data/loadDex.js';
import { renderTable } from './ui/renderTable.js';

document.addEventListener('DOMContentLoaded', async () => {
  const status = document.getElementById('status');

  try {
    status.textContent = 'Loading Pokédex…';

    // Load from API, fallback to local JSON
    const data = await loadPokedexData();

    // Render full table by default
    renderTable(data);

    status.textContent = `Loaded ${data.length} Pokémon`;
  } catch (err) {
    console.error('Initialization failed:', err);
    status.textContent = 'Failed to load Pokédex.';
  }
});
