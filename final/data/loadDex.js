const API_LIST = 'https://pokeapi.co/api/v2/pokemon?limit=2000';
const LOCAL_JSON = '../data/national-pokedex-slim.json'; // ✅ FIXED PATH

function capitalize(str = '') {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// -------- API LOADER --------
async function loadFromAPI() {
  console.log('Attempting to load from PokéAPI…');

  const listRes = await fetch(API_LIST);
  if (!listRes.ok) throw new Error('API list failed');

  const list = await listRes.json();

  const pokemon = await Promise.all(
    list.results.map(async (item) => {
      const res = await fetch(item.url);
      if (!res.ok) throw new Error('API detail failed');

      const p = await res.json();

      return {
        id: p.id,
        name: capitalize(p.name),
        types: p.types.map(t => capitalize(t.type.name)),
        region: '—',        // API-only mode
        generation: '—'
      };
    })
  );

  console.log('Loaded from API:', pokemon.length);
  return pokemon.sort((a, b) => a.id - b.id);
}

// -------- LOCAL JSON LOADER --------
async function loadFromLocal() {
  console.log('Loading from local JSON…');

  const res = await fetch(LOCAL_JSON);
  if (!res.ok) throw new Error('Local JSON fetch failed');

  const data = await res.json();
  console.log('Loaded from local JSON:', data.length);

  return data;
}

// -------- PUBLIC FUNCTION --------
export async function loadPokedexData() {
  try {
    return await loadFromAPI();
  } catch (err) {
    console.warn('API failed, falling back to local JSON:', err.message);
    return await loadFromLocal();
  }
}
