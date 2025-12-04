export function renderPokemonList(list) {
  const grid = document.getElementById("pokedexGrid");
  grid.innerHTML = "";

  if (!list || list.length === 0) {
    grid.innerHTML = "<p>No Pokémon found.</p>";
    return;
  }

  list.forEach((p) => {
    const card = document.createElement("div");
    card.className = "pokemon-card";

    card.innerHTML = `
      <div class="spriteWrap">
        <img class="sprite" src="${p.sprite}" alt="${p.name}">
      </div>
      <div class="info">
        <div class="titleRow">
          <h3 class="name">${p.name}</h3>
          <span class="id">#${p.id}</span>
        </div>
        <div class="types">
          ${p.types.map(t => `<span class="typeBadge">${t}</span>`).join("")}
        </div>
      </div>
    `;

    grid.appendChild(card);
  });
}
