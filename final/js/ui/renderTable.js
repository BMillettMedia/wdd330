export function renderTable(pokemonList) {
  const tbody = document.querySelector('#pokedex-table tbody');
  tbody.innerHTML = '';

  pokemonList.forEach(p => {
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>${p.id}</td>
      <td>${p.name}</td>
      <td>${p.types.join(' / ')}</td>
      <td>${p.region ?? '—'}</td>
      <td>${p.generation ?? '—'}</td>
    `;

    tbody.appendChild(tr);
  });
}
