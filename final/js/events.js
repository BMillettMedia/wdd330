import { state } from "../modules/state.js";
import { renderGrid } from "../modules/renderer.js";

export function setupSearch() {
  const input = document.getElementById("search");
  const grid = document.getElementById("pokedex-grid");

  input.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();

    const filtered = state.pokemon.filter((p) =>
      p.name.toLowerCase().includes(query)
    );

    state.filteredPokemon = filtered;

    renderGrid(grid, filtered);
  });
}
