import { loadPokemonList } from './modules/api.js';
import { renderPokemonGrid } from './modules/ui.js';

export async function initData() {
  console.log('📦 Fetching Pokémon data...');
  try {
    const pokemonList = await loadPokemonList(151); // Kanto
    renderPokemonGrid(pokemonList);
  } catch (error) {
    console.error('Failed to load Pokémon data:', error);
  }
}
