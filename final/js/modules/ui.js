import { getPokemon, getPokemonSpecies } from './api.js';
import { getFromStorage, saveToStorage } from './storage.js';
import { isFavorite, toggleFavorite, loadFavorites } from './favorites.js';
import { capitalize } from './utils.js';

const PAGE_SIZE = 40;
const grid = document.getElementById('pokedex-grid');
const template = document.getElementById('pokemonCardTemplate');
const pageInfo = document.getElementById('pageInfo');
const prevBtn = document.getElementById('prevPage');
const nextBtn = document.getElementById('nextPage');

let currentList = [];
let page = 0;

export async function renderPokemonGrid(list = [], options = {}) {
  currentList = Array.isArray(list) ? list : [];
  page = 0;
  await renderPage();
}

async function fetchDetailsForItem(item) {
  const cache = getFromStorage('pokedex_cache') || {};
  const id = item.url ? item.url.split('/').filter(Boolean).pop() : item.id;
  if (cache[id]) return cache[id];
  try {
    const details = await getPokemon(item.name || id);
    cache[id] = details;
    saveToStorage('pokedex_cache', cache);
    return details;
  } catch {
    return null;
  }
}

export async function renderPage() {
  if (!currentList) return;
  grid.innerHTML = '';
  const start = page * PAGE_SIZE;
  const pageSlice = currentList.slice(start, start + PAGE_SIZE);
  if (pageSlice.length === 0) {
    grid.innerHTML = '<div class="empty">No Pokémon on this page.</div>';
    return;
  }

  await Promise.all(pageSlice.map(async (item) => {
    const details = await fetchDetailsForItem(item);
    const card = template.content.cloneNode(true);
    const article = card.querySelector('.pokemon-card');
    const nameEl = card.querySelector('.name');
    const idEl = card.querySelector('.id');
    const imgEl = card.querySelector('.sprite');
    const typesWrap = card.querySelector('.types');
    const favBtn = card.querySelector('.favBtn');

    const displayName = (details && details.name) ? details.name : item.name;
    const pokemonId = details?.id || (item.url ? item.url.split('/').filter(Boolean).pop() : '—');

    nameEl.textContent = capitalize(displayName);
    idEl.textContent = `#${String(pokemonId).padStart(3,'0')}`;

    const sprite = details?.sprites?.other?.['official-artwork']?.front_default
      || details?.sprites?.front_default
      || `/assets/img/placeholder.png`;

    imgEl.src = sprite;
    imgEl.alt = displayName;

    typesWrap.innerHTML = '';
    (details?.types || []).forEach(t => {
      const s = document.createElement('span');
      s.className = 'typeBadge';
      s.textContent = t.type.name;
      typesWrap.appendChild(s);
    });

    const idNum = Number(pokemonId);
    favBtn.textContent = isFavorite(idNum) ? '★' : '☆';
    favBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFavorite(idNum);
      favBtn.textContent = isFavorite(idNum) ? '★' : '☆';
      renderFavoritesListIfOpen();
    });

    article.addEventListener('click', () => openDetail(idNum));

    grid.appendChild(card);
  }));

  pageInfo.textContent = `Page ${page + 1}`;
  prevBtn.disabled = page === 0;
  nextBtn.disabled = (page + 1) * PAGE_SIZE >= currentList.length;

  prevBtn.onclick = () => { if (page > 0) { page--; renderPage(); } };
  nextBtn.onclick = () => { if ((page + 1) * PAGE_SIZE < currentList.length) { page++; renderPage(); } };
}

/* -----------------------
   Detail modal
----------------------- */
const detailModal = document.getElementById('detailModal');
const detailBody = document.getElementById('detailBody');
const closeModal = document.getElementById('closeModal');

closeModal.addEventListener('click', closeDetail);
window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDetail(); });

export async function openDetail(idOrName) {
  detailBody.innerHTML = `<div class="loading">Loading...</div>`;
  detailModal.classList.remove('hidden');
  detailModal.setAttribute('aria-hidden', 'false');
  try {
    const details = await getPokemon(idOrName);
    const species = await getPokemonSpecies(details.id);
    renderDetail(details, species);
  } catch {
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

  detailBody.innerHTML = html;

  if (species && species.evolution_chain && species.evolution_chain.url) {
    fetch(species.evolution_chain.url).then(r=>r.json()).then(evo=>{
      const names = [];
      let node = evo.chain;
      while (node) {
        names.push(node.species.name);
        node = node.evolves_to && node.evolves_to[0] ? node.evolves_to[0] : null;
      }
      const el = document.getElementById('evoChain');
      if (el) el.innerHTML = names.map(n => `<span style="text-transform:capitalize">${n}</span>`).join(' → ');
    }).catch(()=> {
      const el = document.getElementById('evoChain');
      if (el) el.innerHTML = 'Unavailable';
    });
  } else {
    const el = document.getElementById('evoChain');
    if (el) el.innerHTML = 'Not available';
  }

  const favBtnHtml = `<div style="margin-top:0.7rem"><button id="detailFavBtn">${isFavorite(details.id) ? '★ Favorite' : '☆ Add to Favorites'}</button></div>`;
  detailBody.insertAdjacentHTML('beforeend', favBtnHtml);
  document.getElementById('detailFavBtn').addEventListener('click', () => {
    toggleFavorite(details.id);
    document.getElementById('detailFavBtn').textContent = isFavorite(details.id) ? '★ Favorite' : '☆ Add to Favorites';
    renderFavoritesListIfOpen();
  });
}

/* -----------------------
   Favorites panel helper
----------------------- */
const favoritesPanel = document.getElementById('favoritesPanel');
const favoritesList = document.getElementById('favoritesList');
const favoritesBtn = document.getElementById('favoritesBtn');
const closeFavorites = document.getElementById('closeFavorites');

favoritesBtn.addEventListener('click', () => {
  renderFavoritesList();
  favoritesPanel.classList.remove('hidden');
  favoritesPanel.setAttribute('aria-hidden', 'false');
});
closeFavorites.addEventListener('click', () => {
  favoritesPanel.classList.add('hidden');
  favoritesPanel.setAttribute('aria-hidden', 'true');
});

export async function renderFavoritesList() {
  favoritesList.innerHTML = '';
  const fav = loadFavorites();
  if (!fav || fav.length === 0) {
    favoritesList.innerHTML = '<p>No favorites yet. Click ☆ on a card to add.</p>';
    return;
  }
  for (const id of fav) {
    try {
      const details = await getPokemon(id);
      const el = document.createElement('div');
      el.className = 'pokemon-card';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.gap = '0.6rem';
      el.style.marginBottom = '0.6rem';
      el.innerHTML = `
        <img src="${details.sprites.front_default || `/assets/img/placeholder.png`}" width="56" height="56" alt="${details.name}" style="image-rendering:pixelated"/>
        <div style="flex:1"><strong style="text-transform:capitalize">${details.name}</strong><div style="color:var(--muted)">#${String(details.id).padStart(3,'0')}</div></div>
        <button class="smallRemove" data-id="${id}">Remove</button>
      `;
      el.querySelector('.smallRemove').addEventListener('click', () => {
        toggleFavorite(id);
        renderFavoritesList();
      });
      el.addEventListener('click', () => openDetail(id));
      favoritesList.appendChild(el);
    } catch (e) {
      console.warn('fav render failed', e);
    }
  }
}

function renderFavoritesListIfOpen() {
  if (!favoritesPanel.classList.contains('hidden')) {
    renderFavoritesList();
  }
}

/* -----------------------
   Search helper
----------------------- */
export async function searchAndOpen(query) {
  if (!query) return;
  const q = query.trim().toLowerCase();
  if (/^\d+$/.test(q)) {
    try { await openDetail(Number(q)); return; } catch {}
  }

  try {
    await openDetail(q);
    return;
  } catch (e) {
    const cachedList = getFromStorage('pokedex_list') || [];
    const filtered = cachedList.filter(p => p.name.includes(q));
    if (filtered.length > 0) {
      renderPokemonGrid(filtered.map(p => p), { fromList: true });
    } else {
      grid.innerHTML = `<div class="empty">No Pokémon named "${query}" found.</div>`;
    }
  }
}
