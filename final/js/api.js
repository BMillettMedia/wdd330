import { capitalize, regionFromId, generationFromId } from './utils.js';

// Primary loader: attempts to fetch a complete summary from PokéAPI
export async function loadAll() {
  // Try to fetch full list from PokéAPI
  try {
    const summaryResp = await fetch('https://pokeapi.co/api/v2/pokemon?limit=2000');
    if (!summaryResp.ok) throw new Error('API summary fetch failed');
    const summaryJson = await summaryResp.json(); // .results array with {name,url}

    // We'll fetch details in batches to avoid long blocking calls.
    // For the UI, we need only id, name, types, generation/region.
    const summaries = summaryJson.results;

    // Map to lightweight objects by parsing id from the url, and fetch types via detail fetch per item.
    // To keep initial load responsive, fetch details in small batches (50 at a time).
    const results = [];
    const batchSize = 50;
    for (let i = 0; i < summaries.length; i += batchSize) {
      const batch = summaries.slice(i, i + batchSize);
      const detailsPromises = batch.map(async item => {
        try {
          const res = await fetch(item.url);
          if (!res.ok) throw new Error('detail failed');
          const d = await res.json();
          return {
            id: d.id,
            name: capitalize(d.name),
            types: d.types.map(t => capitalize(t.type.name)),
            region: regionFromId(d.id),
            generation: generationFromId(d.id)
          };
        } catch (e) {
          // skip or return minimal fallback using id parsed from url
          const id = parseInt(item.url.split('/').filter(Boolean).pop(), 10);
          return { id, name: capitalize(item.name), types: ['Unknown'], region: regionFromId(id), generation: generationFromId(id) };
        }
      });

      const details = await Promise.all(detailsPromises);
      results.push(...details);

      // slight delay to avoid hitting rate limits; can be tuned
      await new Promise(r => setTimeout(r, 150));
    }

    // sort by id
    results.sort((a,b) => a.id - b.id);
    return results;

  } catch (err) {
    console.warn('API loadAll failed, falling back to local JSON', err);
    // Load local fallback
    const fallbackResp = await fetch('./data/national-pokedex.json');
    const fallbackJson = await fallbackResp.json();
    return fallbackJson;
  }
}

// Fetch a single pokemon by name (case-insensitive) — try API then fallback
export async function fetchByName(name) {
  if (!name) return null;
  const q = name.trim().toLowerCase();

  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(q)}`);
    if (!res.ok) throw new Error('Not found on API');
    const d = await res.json();
    return {
      id: d.id,
      name: capitalize(d.name),
      types: d.types.map(t => capitalize(t.type.name)),
      region: regionFromId(d.id),
      generation: generationFromId(d.id)
    };
  } catch (err) {
    // fallback: search local file
    try {
      const fallbackResp = await fetch('./data/national-pokedex.json');
      const fallbackJson = await fallbackResp.json();
      const found = fallbackJson.find(p => p.name.toLowerCase() === q);
      return found || null;
    } catch (e) {
      return null;
    }
  }
}
