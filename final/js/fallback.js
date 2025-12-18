export async function loadFallback() {
  const r = await fetch('./data/national-pokedex-slim.json');
  return r.json();
}
