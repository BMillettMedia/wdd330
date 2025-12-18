import { regionFromId, generationFromId, capitalize } from './utils.js';
import { loadFallback } from './fallback.js';

export async function loadAll() {
  try {
    const r = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1300');
    const summary = await r.json();
    
    const output = [];

    for (const item of summary.results) {
      const dRes = await fetch(item.url);
      const d = await dRes.json();

      output.push({
        id: d.id,
        name: capitalize(d.name),
        types: d.types.map(t => capitalize(t.type.name)),
        region: regionFromId(d.id),
        generation: generationFromId(d.id)
      });
    }

    return output;

  } catch (err) {
    console.warn("API failed — using local slim dex.");
    return loadFallback();
  }
}
