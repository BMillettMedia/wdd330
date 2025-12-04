import { handleError } from './utils.js';

const BASE = 'https://pokeapi.co/api/v2';

/**
 * Fetch list of pokemon summaries (name, url)
 * limit: use a big number to get the full list
 */
export async function loadPokemonList(limit = 2000, offset = 0) {
  const url = `${BASE}/pokemon?limit=${limit}&offset=${offset}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`List fetch failed: ${res.status}`);
  const data = await res.json();
  return data.results; // array of {name, url}
}

/**
 * Fetch full details for a pokemon by id or name.
 * Returns STAT, types, sprites, abilities, etc.
 */
export async function getPokemonDetails(idOrName) {
  try {
    const res = await fetch(`${BASE}/pokemon/${idOrName}`);
    if (!res.ok) throw new Error(`Details fetch failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    handleError(err);
    throw err;
  }
}

/**
 * Fetch species data (flavor text, evolution chain url)
 */
export async function getPokemonSpecies(idOrName) {
  const res = await fetch(`${BASE}/pokemon-species/${idOrName}`);
  if (!res.ok) return null;
  return await res.json();
}

/**
 * Fetch evolution chain by URL or ID
 */
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
    console.warn('evo chain fetch failed', err);
    return null;
  }
}
