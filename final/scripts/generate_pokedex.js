// scripts/generate_pokedex.js
// Node 18+ recommended (fetch built-in).
// Run: node scripts/generate_pokedex.js

import fs from 'fs/promises';

const BASE = 'https://pokeapi.co/api/v2';
const OUT_DIR = './data';
const SLIM_OUT = `${OUT_DIR}/national-pokedex-slim.json`;
const FULL_OUT = `${OUT_DIR}/national-pokedex-full.json`;

function regionFromId(id) {
  if (id <= 151) return "Kanto";
  if (id <= 251) return "Johto";
  if (id <= 386) return "Hoenn";
  if (id <= 493) return "Sinnoh";
  if (id <= 649) return "Unova";
  if (id <= 721) return "Kalos";
  if (id <= 809) return "Alola";
  if (id <= 905) return "Galar";
  return "Paldea";
}

function generationFromId(id) {
  if (id <= 151) return 1;
  if (id <= 251) return 2;
  if (id <= 386) return 3;
  if (id <= 493) return 4;
  if (id <= 649) return 5;
  if (id <= 721) return 6;
  if (id <= 809) return 7;
  if (id <= 905) return 8;
  return 9;
}

function capitalize(s = "") {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed ${res.status}: ${url}`);
  return res.json();
}

async function main() {
  console.log('Fetching summary list…');
  const list = await fetchJson(`${BASE}/pokemon?limit=2000`);
  const results = list.results;

  console.log(`Found ${results.length} Pokémon — fetching details in batches…`);

  const concurrency = 8;
  const delayBetweenBatches = 200;

  const full = [];
  const slim = [];

  for (let i = 0; i < results.length; i += concurrency) {
    const batch = results.slice(i, i + concurrency);

    const promises = batch.map(async item => {
      try {
        const data = await fetchJson(item.url);

        full.push(data);

        slim.push({
          id: data.id,
          name: capitalize(data.name),
          types: data.types.map(t => capitalize(t.type.name)),
          region: regionFromId(data.id),
          generation: generationFromId(data.id)
        });

      } catch (err) {
        console.warn(`Failed to fetch ${item.url}`, err);
      }
    });

    await Promise.all(promises);

    await new Promise(r => setTimeout(r, delayBetweenBatches));

    console.log(`Progress: ${Math.min(i + concurrency, results.length)} / ${results.length}`);
  }

  slim.sort((a, b) => a.id - b.id);
  full.sort((a, b) => a.id - b.id);

  await fs.mkdir(OUT_DIR, { recursive: true });

  console.log(`Saving slim dex → ${SLIM_OUT}`);
  await fs.writeFile(SLIM_OUT, JSON.stringify(slim, null, 2), 'utf8');

  console.log(`Saving full dex → ${FULL_OUT}`);
  await fs.writeFile(FULL_OUT, JSON.stringify(full, null, 2), 'utf8');

  console.log("Done!");
}

main().catch(err => {
  console.error("Error generating dex:", err);
});
