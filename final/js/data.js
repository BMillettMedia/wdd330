import { getPokemonList } from "../modules/api.js";
import { renderGrid } from "../modules/renderer.js";
import { state } from "../modules/state.js";

const grid = document.getElementById("pokedex-grid");

export async function loadInitialPokemon() {
  try {
    grid.innerHTML = "<p>Loading...</p>";

    const total = 151; // Start with Gen 1 for speed
    const pokemon = await getPokemonList(0, total);

    state.pokemon = pokemon;

    renderGrid(grid, pokemon);
  } catch (err) {
    console.error(err);
    grid.innerHTML = `<p class="error">Failed to load Pokémon. Try refreshing.</p>`;
  }
}
