// js/events.js

import { state } from '../modules/state.js';
import { renderGrid } from '../modules/renderer.js';

export function setupSearch() {
  const input = document.getElementById('search');

  input.addEventListener('input', () => {
    const q = input.value.toLowerCase().trim();

    // Filter the already-loaded Pokémon
    const filtered = state.pokemon.filter(p =>
      p.name.toLowerCase().includes(q)
    );

    const grid = document.getElementById('pokedex-grid');
    renderGrid(grid, filtered);
  });
}
