import { handleError } from './utils.js';
import { put as idbPut, get as idbGet, getAll as idbGetAll, STORE_SUMMARIES, STORE_DETAILS } from './idb.js';

const BASE = 'https://pokeapi.co/api/v2';

export async function loadPokemonList(limit = 2000, offset = 0) {
  try {
    const stored = await idbGetAll(STORE_SUMMARIES);
    if (stored && stored.length > 0) {
      return stored.map(s => ({ name: s.name, url: s.url }));
    }
  } catch (e) {
    console.warn('IDB read error for summaries', e);
  }

  const url = `${BASE}/pokemon?limit=${limit}&offset=${offset}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`List fetch failed (${res.status})`);
    const data = await res.json();

    // store summary items
    try {
      for (const item of data.results) {
        await idbPut(STORE_SUMMARIES, { name: item.name, url: item.url });
      }
    } catch (e) {
      console.warn('IDB store summaries failed', e);
    }

    return data.results;
  } catch (err) {
    handleError(err);
    // fallback local JSON
    try {
      const fallback = await fetch('./data/pokedex-fallback.json').then(r => r.json());
      return fallback.results || [];
    } catch (e) {
      handleError(e);
      return [];
    }
  }
}

export async function getPokemon(idOrName) {
  const numeric = /^\d+$/.test(String(idOrName));
  try {
    if (numeric) {
      const cached = await idbGet(STORE_DETAILS, Number(idOrName));
      if (cached) return cached;
    } else {
      const all = await idbGetAll(STORE_DETAILS);
      const found = all.find(x => x.name && x.name.toLowerCase() === String(idOrName).toLowerCase());
      if (found) return found;
    }
  } catch (e) {
    console.warn('IDB read details failed', e);
  }

  try {
    const url = `${BASE}/pokemon/${idOrName}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`getPokemon failed (${res.status})`);
    const details = await res.json();
    try {
      await idbPut(STORE_DETAILS, details);
    } catch (e) {
      console.warn('IDB store detail failed', e);
    }
    return details;
  } catch (err) {
    handleError(err);
    throw err;
  }
}

export async function getPokemonSpecies(idOrName) {
  const url = `${BASE}/pokemon-species/${idOrName}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('species fetch failed');
    return await res.json();
  } catch (err) {
    handleError(err);
    return null;
  }
}

export async function getEvolutionChain(chainUrlOrId) {
  try {
    if (typeof chainUrlOrId === 'number') {
      const res = await fetch(`${BASE}/evolution-chain/${chainUrlOrId}`);
      return await res.json();
    } else {
      const res = await fetch(chainUrlOrId);
      return await res.json();
    }
  } catch (err) {
    handleError(err);
    return null;
  }
}


// modules/api.js

const API_BASE = 'https://pokeapi.co/api/v2/pokemon';

export async function getPokemonById(id) {
  const res = await fetch(`${API_BASE}/${id}`);
  if (!res.ok) throw new Error(`Pokémon ${id} not found`);
  return res.json();
}

export async function getPokemonList(offset = 0, limit = 50) {
  const res = await fetch(`${API_BASE}?offset=${offset}&limit=${limit}`);
  const data = await res.json();

  // Each URL gives full Pokémon details including sprites & stats
  const detailed = await Promise.all(
    data.results.map(p => fetch(p.url).then(r => r.json()))
  );

  return detailed;
}
