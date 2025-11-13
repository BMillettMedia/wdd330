import { initTheme } from './modules/theme.js';
import { renderPokemonGrid } from './modules/ui.js';

export function initUI() {
  console.log('🖥 Setting up UI...');
  initTheme();
  const grid = document.querySelector('#pokedex-grid');
  if (grid) grid.innerHTML = '<p>Loading Pokémon data...</p>';
}
