import { getPokemonList } from "../modules/api.js";
import { renderGrid } from "../modules/renderer.js";
import { state } from "../modules/state.js";

const grid = document.getElementById("pokedex-grid");

export async function loadInitialPokemon() {
  const grid = document.getElementById("pokedex-grid");
  grid.innerHTML = "<p>Loading...</p>";

  try {
    const pokemon = await getPokemonList(0, 151); // Gen 1 for fast load

    state.pokemon = pokemon;
    state.filteredPokemon = pokemon;

    renderGrid(grid, pokemon);

  } catch (err) {
    console.error(err);
    grid.innerHTML = "<p>Error loading Pokémon. Please refresh.</p>";
  }
}
