// main.js
// Pokédex Explorer - Starter JS
// Structure: API module, Storage module, UI module
// Uses PokéAPI with caching to localStorage and a local JSON fallback if needed.

const API_BASE = 'https://pokeapi.co/api/v2';
const PAGE_SIZE = 40; // how many per page (tune for performance)
const FALLBACK_JSON = 'data/pokedex-fallback.json';

// ------------- Storage Module -------------
const Storage = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      console.error('Storage.get error', e);
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Storage.set error', e);
    }
  },
  addFavorite(id) {
    const fav = this.get('pokedex_favorites', []);
    if (!fav.includes(id)) {
      fav.push(id);
      this.set('pokedex_favorites', fav);
    }
  },
  removeFavorite(id) {
    const fav = this.get('pokedex_favorites', []);
    const idx = fav.indexOf(id);
    if (idx !== -1) {
      fav.splice(idx, 1);
      this.set('pokedex_favorites', fav);
    }
  },
  isFavorite(id) {
    const fav = this.get('pokedex_favorites', []);
    return fav.includes(id);
  },
  cachePokemon(id, data) {
    const cache = this.get('pokedex_cache', {});
    cache[id] = data;
    this.set('pokedex_cache', cache);
  },
  getCachedPokemon(id) {
    const cache = this.get('pokedex_cache', {});
    return cache[id] || null;
  }
};

// ------------- API Module -------------
const Api = {
  async fetchJSON(url) {
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return await r.json();
    } catch (e) {
      console.warn('Fetch failed:', url, e);
      throw e;
    }
  },

  // load a page of pokemon (method uses listing endpoint)
  async listPokemons(limit = PAGE_SIZE, offset = 0) {
    const url = `${API_BASE}/pokemon?limit=${limit}&offset=${offset}`;
    try {
      return await this.fetchJSON(url);
    } catch (e) {
      // fallback: try local JSON
      console.warn('Falling back to local JSON list');
      const local = await fetch(FALLBACK_JSON).then(r => r.json());
      // happy path: return structure like API: results = [{name,url},...]
      // local JSON must include `results` array with name/url or at least id/name
      return { results: local.results || [] };
    }
  },

  // get details by name or id
  async getPokemon(idOrName) {
    // check cache
    const cached = Storage.getCachedPokemon(idOrName);
    if (cached) return cached;

    try {
      const data = await this.fetchJSON(`${API_BASE}/pokemon/${idOrName}`);
      // also fetch species for flavor text + evolution chain url
      const species = await this.fetchJSON(`${API_BASE}/pokemon-species/${data.id}`);
      // fetch evolution chain if present (do not await too long)
      let evolChain = null;
      if (species.evolution_chain && species.evolution_chain.url) {
        try {
          evolChain = await this.fetchJSON(species.evolution_chain.url);
        } catch (e) {
          console.warn('Evolution fetch failed', e);
        }
      }
      const assembled = { base: data, species, evolution: evolChain };
      Storage.cachePokemon(data.id, assembled);
      return assembled;
    } catch (e) {
      // try to return minimal from fallback JSON
      console.warn('getPokemon fallback attempt for', idOrName);
      try {
        const local = await fetch(FALLBACK_JSON).then(r => r.json());
        const found = local.results.find(p => p.name === String(idOrName).toLowerCase() || p.id == idOrName);
        if (found) return { base: found, species: null, evolution: null };
      } catch (e2) {
        console.error('Local fallback failed', e2);
      }
      throw e;
    }
  }
};

// ------------- UI Module -------------
const UI = (() => {
  // DOM refs
  const grid = document.getElementById('pokedexGrid');
  const template = document.getElementById('pokemonCardTemplate');
  const searchInput = document.getElementById('searchInput');
  const regionSelect = document.getElementById('regionSelect');
  const prevBtn = document.getElementById('prevPage');
  const nextBtn = document.getElementById('nextPage');
  const pageInfo = document.getElementById('pageInfo');
  const detailModal = document.getElementById('detailModal');
  const detailBody = document.getElementById('detailBody');
  const closeModal = document.getElementById('closeModal');
  const themeToggle = document.getElementById('themeToggle');
  const favoritesBtn = document.getElementById('favoritesBtn');
  const favoritesPanel = document.getElementById('favoritesPanel');
  const closeFavorites = document.getElementById('closeFavorites');
  const favoritesList = document.getElementById('favoritesList');
  const typeFilters = document.getElementById('typeFilters');

  // state
  let page = 0;
  let total = 0;
  let currentResults = [];
  let activeType = null;

  // all types (hardcoded small list; expand if you want to fetch /type)
  const ALL_TYPES = ['normal','fire','water','grass','electric','ice','fighting','poison','ground','flying','psychic','bug','rock','ghost','dragon','dark','steel','fairy'];

  // initialize UI
  function init() {
    // render type pills
    ALL_TYPES.forEach(t => {
      const btn = document.createElement('button');
      btn.className = 'type-pill';
      btn.textContent = t;
      btn.dataset.type = t;
      btn.addEventListener('click', () => {
        if (activeType === t) { activeType = null; btn.classList.remove('active'); }
        else {
          activeType = t;
          // toggle classes
          document.querySelectorAll('.type-pill').forEach(p=>p.classList.remove('active'));
          btn.classList.add('active');
        }
        renderCurrent(); // apply filter re-render
      });
      typeFilters.appendChild(btn);
    });

    // wire events
    searchInput.addEventListener('input', onSearch);
    prevBtn.addEventListener('click', () => changePage(-1));
    nextBtn.addEventListener('click', () => changePage(1));
    closeModal.addEventListener('click', closeDetail);
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDetail(); });
    themeToggle.addEventListener('click', toggleTheme);
    favoritesBtn.addEventListener('click', openFavorites);
    closeFavorites.addEventListener('click', closeFavoritesPanel);

    // load theme
    const theme = Storage.get('pokedex_theme','light');
    document.documentElement.setAttribute('data-theme', theme);
    themeToggle.textContent = (theme === 'dark') ? '☀️' : '🌙';

    // initial load
    loadPage(0);
  }

  async function loadPage(pageIndex = 0) {
    page = Math.max(0, pageIndex);
    const offset = page * PAGE_SIZE;
    try {
      const list = await Api.listPokemons(PAGE_SIZE, offset);
      currentResults = list.results || [];
      total = list.count || (currentResults.length + offset);
      renderCurrent();
      pageInfo.textContent = `Page ${page + 1}`;
      prevBtn.disabled = page === 0;
      // disable next if not sure; you can improve with list.count
      // nextBtn.disabled = (offset + PAGE_SIZE) >= total;
    } catch (e) {
      console.error('loadPage error', e);
      grid.innerHTML = `<div class="error">Unable to load Pokédex. Try again or use offline mode.</div>`;
    }
  }

  async function renderCurrent() {
    grid.innerHTML = '';
    const q = searchInput.value.trim().toLowerCase();
    // filter by search and activeType
    const filtered = currentResults.filter(item => {
      const name = (item.name || '').toLowerCase();
      const id = item.url ? item.url.split('/').filter(Boolean).pop() : (item.id || '');
      let matches = true;
      if (q) matches = name.includes(q) || String(id).includes(q);
      return matches;
    });

    if (filtered.length === 0) {
      grid.innerHTML = `<div class="empty">No Pokémon found on this page. Try search or change page.</div>`;
      return;
    }

    // for each result, fetch summary data (or use cached minimal info)
    await Promise.all(filtered.map(async (res) => {
      try {
        // If item.url exists, fetch minimal info from that endpoint
        let base;
        if (res.url) {
          // try to get cached minimal by id
          const id = res.url.split('/').filter(Boolean).pop();
          const cached = Storage.getCachedPokemon(id);
          if (cached && cached.base) {
            base = cached.base;
          } else {
            // fetch lightweight detail
            base = await Api.fetchJSON(res.url);
          }
        } else {
          base = res; // fallback if local JSON partial
        }

        // if activeType filtering is set, check types
        if (activeType) {
          const types = (base.types || []).map(t => t.type.name);
          if (!types.includes(activeType)) return; // skip rendering this card
        }

        const card = template.content.cloneNode(true);
        const article = card.querySelector('.pokemon-card');
        const nameEl = card.querySelector('.name');
        const idEl = card.querySelector('.id');
        const imgEl = card.querySelector('.sprite');
        const typesWrap = card.querySelector('.types');
        const favBtn = card.querySelector('.favBtn');

        const displayName = base.name || base.species?.name || base.title || 'unknown';
        const pokemonId = base.id || (res.id || res.pokemon_id) || (res.url ? res.url.split('/').filter(Boolean).pop() : '—');

        nameEl.textContent = displayName;
        idEl.textContent = `#${String(pokemonId).padStart(3,'0')}`;

        // sprite handling (prefer official artwork)
        const sprite = base.sprites?.other?.['official-artwork']?.front_default
                      || base.sprites?.front_default
                      || base.sprites?.front_shiny
                      || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;
        imgEl.src = sprite;
        imgEl.alt = `${displayName} sprite`;

        // types
        (base.types || []).forEach(t => {
          const b = document.createElement('span');
          b.className = 'typeBadge';
          b.textContent = t.type.name;
          typesWrap.appendChild(b);
        });

        // favorite button
        const toggleFav = () => {
          const idNum = Number(pokemonId);
          if (Storage.isFavorite(idNum)) {
            Storage.removeFavorite(idNum);
            favBtn.textContent = '☆';
            favBtn.title = 'Add to favorites';
          } else {
            Storage.addFavorite(idNum);
            favBtn.textContent = '★';
            favBtn.title = 'Remove favorite';
          }
          renderFavoritesList(); // update panel if open
        };
        // initialize fav UI
        const idNum = Number(pokemonId);
        favBtn.textContent = Storage.isFavorite(idNum) ? '★' : '☆';
        favBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleFav(); });

        // open detail on click
        article.addEventListener('click', () => openDetail(pokemonId));

        grid.appendChild(card);
      } catch (err) {
        console.error('card render failed', err);
      }
    }));
  }

  // page navigation
  function changePage(delta) {
    loadPage(page + delta);
  }

  // search handler (with small debounce)
  let searchTimeout = null;
  function onSearch() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      // if user types a full name not in current page we can try direct fetch
      renderCurrent();
    }, 200);
  }

  // Detail modal
  async function openDetail(idOrName) {
    try {
      detailBody.innerHTML = `<div class="loading">Loading...</div>`;
      detailModal.classList.remove('hidden');
      detailModal.setAttribute('aria-hidden','false');

      const data = await Api.getPokemon(idOrName);
      // assemble UI
      detailBody.innerHTML = ''; // clear
      const base = data.base;
      const species = data.species;
      const evo = data.evolution;

      const head = document.createElement('div');
      head.className = 'detail-head';
      head.innerHTML = `
        <div style="display:flex;gap:1rem;align-items:center">
          <img src="${base.sprites?.other?.['official-artwork']?.front_default || base.sprites?.front_default || ''}" alt="${base.name}" width="140" style="image-rendering:pixelated"/>
          <div>
            <h2 style="margin:0;text-transform:capitalize">${base.name} <small style="color:var(--muted);">#${String(base.id).padStart(3,'0')}</small></h2>
            <div style="margin-top:0.4rem"></div>
          </div>
        </div>
      `;
      detailBody.appendChild(head);

      // types & abilities
      const meta = document.createElement('div');
      meta.style.marginTop = '0.6rem';
      meta.innerHTML = `
        <div><strong>Types:</strong> ${ (base.types||[]).map(t=>t.type.name).join(', ') }</div>
        <div><strong>Abilities:</strong> ${ (base.abilities||[]).map(a=>a.ability.name).join(', ') }</div>
      `;
      detailBody.appendChild(meta);

      // flavor text
      if (species) {
        const flavor = (species.flavor_text_entries || []).find(f => f.language.name === 'en');
        if (flavor) {
          const p = document.createElement('p');
          p.style.marginTop = '0.6rem';
          p.textContent = flavor.flavor_text.replace(/\n|\f/g,' ');
          detailBody.appendChild(p);
        }
      }

      // stats
      const statsWrap = document.createElement('div');
      statsWrap.style.marginTop = '0.6rem';
      statsWrap.innerHTML = '<h3>Base Stats</h3>';
      (base.stats || []).forEach(s => {
        const statRow = document.createElement('div');
        statRow.className = 'statBar';
        statRow.innerHTML = `
          <div class="label">${s.stat.name}</div>
          <div class="bar"><i style="width:${Math.min(100, (s.base_stat / 2))}%"></i></div>
          <div style="width:36px;text-align:right;font-weight:600;margin-left:8px">${s.base_stat}</div>
        `;
        statsWrap.appendChild(statRow);
      });
      detailBody.appendChild(statsWrap);

      // evolution
      if (evo && evo.chain) {
        const evoWrap = document.createElement('div');
        evoWrap.style.marginTop = '0.6rem';
        evoWrap.innerHTML = '<h3>Evolution Chain</h3>';
        const list = [];
        // simple traversal
        let node = evo.chain;
        while (node) {
          list.push(node.species.name);
          node = node.evolves_to && node.evolves_to[0] ? node.evolves_to[0] : null;
        }
        evoWrap.innerHTML += `<div>${list.map(n => `<span style="text-transform:capitalize">${n}</span>`).join(' → ')}</div>`;
        detailBody.appendChild(evoWrap);
      }

      // favorite toggle
      const fav = document.createElement('button');
      const myId = Number(base.id);
      fav.textContent = Storage.isFavorite(myId) ? '★ Favorite' : '☆ Add to Favorites';
      fav.style.marginTop = '0.8rem';
      fav.addEventListener('click', () => {
        if (Storage.isFavorite(myId)) {
          Storage.removeFavorite(myId);
          fav.textContent = '☆ Add to Favorites';
        } else {
          Storage.addFavorite(myId);
          fav.textContent = '★ Favorite';
        }
        renderFavoritesList();
      });
      detailBody.appendChild(fav);

    } catch (e) {
      detailBody.innerHTML = `<div class="error">Failed to load details. ${e.message}</div>`;
    }
  }

  function closeDetail() {
    detailModal.classList.add('hidden');
    detailModal.setAttribute('aria-hidden','true');
  }

  // theme
  function toggleTheme(){
    const curr = document.documentElement.getAttribute('data-theme') || 'light';
    const next = curr === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    Storage.set('pokedex_theme', next);
    themeToggle.textContent = (next === 'dark') ? '☀️' : '🌙';
  }

  // favorites panel
  function openFavorites(){
    renderFavoritesList();
    favoritesPanel.classList.remove('hidden');
    favoritesPanel.setAttribute('aria-hidden','false');
  }
  function closeFavoritesPanel(){
    favoritesPanel.classList.add('hidden');
    favoritesPanel.setAttribute('aria-hidden','true');
  }
  async function renderFavoritesList(){
    favoritesList.innerHTML = '';
    const fav = Storage.get('pokedex_favorites', []);
    if (!fav || fav.length === 0) {
      favoritesList.innerHTML = '<p>No favorites yet. Click ☆ on a card to add.</p>';
      return;
    }
    // show a small grid of favorites
    for (const id of fav) {
      try {
        const data = await Api.getPokemon(id);
        const base = data.base;
        const el = document.createElement('div');
        el.className = 'pokemon-card';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.gap = '0.6rem';
        el.style.marginBottom = '0.6rem';
        el.innerHTML = `
          <img src="${base.sprites?.front_default || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`}" width="56" height="56" alt="${base.name}" style="image-rendering:pixelated"/>
          <div style="flex:1"><strong style="text-transform:capitalize">${base.name}</strong><div style="color:var(--muted)">#${String(base.id).padStart(3,'0')}</div></div>
          <button class="smallRemove" data-id="${id}">Remove</button>
        `;
        el.querySelector('.smallRemove').addEventListener('click', () => {
          Storage.removeFavorite(id);
          renderFavoritesList();
        });
        el.addEventListener('click', () => openDetail(id));
        favoritesList.appendChild(el);
      } catch (e) {
        console.warn('fav render failed', e);
      }
    }
  }

  return { init, loadPage };
})();

// initialize app
document.addEventListener('DOMContentLoaded', () => {
  UI.init();
});
