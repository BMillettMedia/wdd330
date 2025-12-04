import { getPokemonDetails, getPokemonSpecies, getEvolutionChain } from './api.js';
import { get as idbGet, put as idbPut } from './idb.js';
import { capitalize } from './utils.js';
import { isFavorite, toggleFavorite } from './favorites.js';

const detailModal = document.getElementById('detailModal');
const detailBody = document.getElementById('detailBody');
const closeModal = document.getElementById('closeModal');

closeModal.addEventListener('click', closeDetail);
window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDetail(); });

export async function openDetail(idOrName, maybeName = null) {
  detailBody.innerHTML = `<div class="loading">Loading...</div>`;
  detailModal.classList.remove('hidden');
  detailModal.setAttribute('aria-hidden', 'false');

  try {
    // Check IDB cache first
    const id = Number(idOrName);
    let details = null;
    if (!isNaN(id)) details = await idbGet('details', id);
    if (!details) {
      details = await getPokemonDetails(idOrName);
      try { await idbPut('details', details); } catch(e){/*ignore*/ }
    }

    const species = await getPokemonSpecies(details.id);
    renderDetail(details, species);
  } catch (err) {
    detailBody.innerHTML = `<div class="error">Failed to load details.</div>`;
  }
}

function closeDetail() {
  detailModal.classList.add('hidden');
  detailModal.setAttribute('aria-hidden', 'true');
}

function renderDetail(details, species) {
  const sprite = details.sprites?.other?.['official-artwork']?.front_default || details.sprites?.front_default || '';
  let html = `
    <div style="display:flex;gap:1rem;align-items:center">
      <img src="${sprite}" width="140" style="image-rendering:pixelated" alt="${details.name}" />
      <div>
        <h2 style="margin:0;text-transform:capitalize">${details.name} <small style="color:var(--muted)">#${String(details.id).padStart(3,'0')}</small></h2>
        <div style="margin-top:0.4rem">Types: ${(details.types||[]).map(t=>t.type.name).join(', ')}</div>
        <div>Abilities: ${(details.abilities||[]).map(a=>a.ability.name).join(', ')}</div>
      </div>
    </div>
  `;

  if (species) {
    const flavor = (species.flavor_text_entries || []).find(f => f.language.name === 'en');
    if (flavor) html += `<p style="margin-top:0.5rem">${flavor.flavor_text.replace(/\n|\f/g,' ')}</p>`;
  }

  html += `<h3>Base Stats</h3>`;
  (details.stats || []).forEach(s => {
    const pct = Math.min(100, Math.round(s.base_stat / 2));
    html += `
      <div class="statBar">
        <div class="label">${s.stat.name}</div>
        <div class="bar"><i style="width:${pct}%"></i></div>
        <div style="width:36px;text-align:right;font-weight:600;margin-left:8px">${s.base_stat}</div>
      </div>
    `;
  });

  html += `<div style="margin-top:0.6rem"><h3>Evolution Chain</h3><div id="evoChain">Loading chain...</div></div>`;

  // set HTML then fetch evo chain
  detailBody.innerHTML = html;

  if (species && species.evolution_chain && species.evolution_chain.url) {
    getEvolutionChain(species.evolution_chain.url).then(evo => {
      const names = [];
      let node = evo.chain;
      while (node) {
        names.push(node.species.name);
        node = node.evolves_to && node.evolves_to[0] ? node.evolves_to[0] : null;
      }
      const el = document.getElementById('evoChain');
      if (el) el.innerHTML = names.map(n => `<span style="text-transform:capitalize">${n}</span>`).join(' → ');
    }).catch(() => {
      const el = document.getElementById('evoChain');
      if (el) el.innerHTML = 'Unavailable';
    });
  } else {
    const el = document.getElementById('evoChain');
    if (el) el.innerHTML = 'Not available';
  }

  // favorite button
  const favHTML = `<div style="margin-top:0.7rem"><button id="detailFavBtn">${isFavorite(details.id) ? '★ Favorite' : '☆ Add to Favorites'}</button></div>`;
  detailBody.insertAdjacentHTML('beforeend', favHTML);
  document.getElementById('detailFavBtn').addEventListener('click', () => {
    toggleFavorite(details.id);
    document.getElementById('detailFavBtn').textContent = isFavorite(details.id) ? '★ Favorite' : '☆ Add to Favorites';
  });
}

/* Expose searchAndOpen for filters */
import { getPokemonDetails as getEvolutionChain } from './api.js'; // dummy import to avoid bundler lint (not used above)
export async function searchAndOpen(query) {
  if (!query) return;
  const q = query.trim().toLowerCase();
  // if numeric ID
  if (/^\d+$/.test(q)) {
    try { await openDetail(Number(q)); return; } catch {}
  }
  // try direct fetch by name
  try {
    await openDetail(q);
    return;
  } catch (e) {
    // no direct match
    throw e;
  }
}
