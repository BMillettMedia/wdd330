const API_URL = 'https://pokeapi.co/api/v2/pokemon?limit=2000';
const LOCAL_JSON = './data/national-pokedex-slim.json';

function capitalize(str = '') {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

async function loadFromAPI() {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error('API unavailable');

  const list = await response.json();

  const results = await Promise.all(
    list.results.map(async (item, index) => {
      const res = await fetch(item.url);
      const data = await res.json();

      return {
        id: data.id,
        name: capitalize(data.name),
        types: data.types.map(t => capitalize(t.type.name)),
        region: null,      // API-only fallback won’t have region
        generation: null
      };
    })
  );

  return results.sort((a, b) => a.id - b.id);
}

async function loadFromLocalJSON() {
  const response = await fetch(LOCAL_JSON);
  if (!response.ok) throw new Error('Local JSON missing');
  return response.json();
}

export async function loadPokedexData() {
  try {
    console.log('Trying PokéAPI...');
    return await loadFromAPI();
  } catch (err) {
    console.warn('API failed, using local JSON');
    return await loadFromLocalJSON();
  }
}
