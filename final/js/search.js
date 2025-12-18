import { renderTable } from './render.js';

export function enableSearch(all) {
  const input = document.getElementById('search');
  const form = document.getElementById('searchForm');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const q = input.value.trim().toLowerCase();

    if (!q) {
      renderTable(all);
      return;
    }

    const filtered = all.filter((p) =>
      p.name.toLowerCase().includes(q)
    );

    renderTable(filtered);
  });
}
