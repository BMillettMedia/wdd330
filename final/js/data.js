// js/data.js

import { getPokemonList } from '../modules/api.js';
import { renderGrid } from '../modules/renderer.js';
import { state } from '../modules/state.js';

const grid = document.getElementById('pokedex-grid');

export async function loadInitialPokemon() {
  const pokemon = await getPokemonList(0, 150); // first gen by default
  state.pokemon = pokemon;
  renderGrid(grid, pokemon);
}
