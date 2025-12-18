export function renderTable(pokemonList = []) {
  const tbody = document.querySelector('#pokedex-table tbody');
  tbody.innerHTML = '';

  if (!pokemonList.length) {
    tbody.innerHTML = `<tr><td colspan="5">No Pokémon found.</td></tr>`;
    return;
  }

  pokemonList.forEach(p => {
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>${p.id}</td>
      <td>${p.name}</td>
      <td>${Array.isArray(p.types) ? p.types.join(' / ') : '—'}</td>
    `;

    tbody.appendChild(tr);
  });
}
