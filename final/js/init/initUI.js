import { initTheme } from '../modules/theme.js';

export function initUI() {
  initTheme();
  const grid = document.getElementById('pokedex-grid');
  if (grid) grid.innerHTML = '<div class="loading">Loading Pokédex...</div>';
}
