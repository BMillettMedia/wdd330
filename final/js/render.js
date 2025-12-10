export function renderList(pokemonArray) {
  const listEl = document.getElementById('list');
  const status = document.getElementById('status');

  if (!Array.isArray(pokemonArray) || pokemonArray.length === 0) {
    status.textContent = 'No Pokémon found.';
    listEl.innerHTML = '';
    return;
  }

  status.textContent = `Showing ${pokemonArray.length} Pokémon`;

  listEl.innerHTML = pokemonArray.map(p => `
    <div class="card">
      <h2>#${p.id} – ${p.name}</h2>
      <p><strong>Type:</strong> ${p.types.join(', ')}</p>
      <p><strong>Region:</strong> ${p.region}</p>
      <p><strong>Generation:</strong> ${p.generation}</p>
    </div>
  `).join('');
}
