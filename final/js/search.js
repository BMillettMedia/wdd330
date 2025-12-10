import { renderList } from './render.js';
import { fetchByName } from './api.js';

export function enableSearch(allList) {
  const input = document.getElementById('searchInput');
  const refreshBtn = document.getElementById('refreshBtn');

  // local filtering for typed queries
  input.addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    if (!q) {
      renderList(allList);
      return;
    }

    // if query length small, do local filter; otherwise local + exact API fetch fallback
    const filtered = allList.filter(p => p.name.toLowerCase().includes(q));
    if (filtered.length > 0) {
      renderList(filtered);
    } else {
      // try API exact fetch
      fetchByName(q).then(found => {
        if (found) renderList([found]);
        else {
          const status = document.getElementById('status');
          status.textContent = `No Pokémon found for "${q}"`;
          document.getElementById('list').innerHTML = '';
        }
      });
    }
  });

  // Allow manual refresh to re-pull from API
  refreshBtn.addEventListener('click', () => {
    window.location.reload();
  });
}
