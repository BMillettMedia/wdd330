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


/*export function renderTable(list) {
  const tbody = document.getElementById('table-body');
  tbody.innerHTML = '';

  list.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${p.id}</td>
      <td>${p.name}</td>
      <td>${p.types.join(', ')}</td>
      <td>${p.region}</td>
      <td>${p.generation}</td>
    `;
    tbody.appendChild(tr);
  });
}*/


export function renderTable(list) {
  const container = document.getElementById('tableContainer');

  // overwrite previous content
  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Name</th>
          <th>Types</th>
        </tr>
      </thead>
      <tbody>
        ${list
          .map(
            (p) => `
          <tr>
            <td>${p.id}</td>
            <td>${p.name}</td>
            <td>${p.types.join(', ')}</td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
  `;
}
