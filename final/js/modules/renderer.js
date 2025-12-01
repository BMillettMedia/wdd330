export function renderPokemonCard(pokemon) {
  const sprite =
    pokemon.sprites.other["official-artwork"].front_default ||
    pokemon.sprites.front_default ||
    "./img/placeholder.png"; // optional fallback

  return `
    <div class="pokemon-card" data-id="${pokemon.id}">
      <div class="spriteWrap">
        <img class="sprite" src="${sprite}" alt="${pokemon.name}">
      </div>

      <div class="info">
        <div class="titleRow">
          <h3 class="name">${pokemon.name}</h3>
          <span class="id">#${pokemon.id.toString().padStart(3, "0")}</span>
        </div>

        <div class="types">
          ${pokemon.types
            .map(t => `<span class="typeBadge type-${t.type.name}">${t.type.name}</span>`)
            .join("")}
        </div>
      </div>

      <button class="favBtn">★</button>
    </div>
  `;
}
