// js/data.js

import { getPokemonList } from '../modules/api.js';
import { renderGrid } from '../modules/renderer.js';
import { state } from '../modules/state.js';

const grid = document.getElementById('pokedex-grid');

export async function loadInitialPokemon() {
  // Load all Pokémon from the API
  const total = 1025;  // As of 2024
  const pokemon = await getPokemonList(0, total);

  state.pokemon = pokemon;

  // Render full list immediately
  renderGrid(grid, pokemon);
}
