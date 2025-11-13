// js/modules/filters.js
import { renderPokemonGrid } from './ui.js';
import { loadPokemonList } from './api.js';

let allPokemon = [];

export async function setupFilters() {
  const searchInput = document.getElementById('search');
  if (!searchInput) return;

  allPokemon = await loadPokemonList(151); // You can increase the number for full Pokédex

  renderPokemonGrid(allPokemon);

  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    const filtered = allPokemon.filter((p) =>
      p.name.toLowerCase().includes(query)
    );
    renderPokemonGrid(filtered);
  });
}
