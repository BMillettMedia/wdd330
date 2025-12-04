export async function fetchPokemonList(offset = 0, limit = 30) {
  const url = `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`;

  const res = await fetch(url);
  const json = await res.json();

  const detailed = await Promise.all(
    json.results.map(async (p) => {
      const detailRes = await fetch(p.url);
      const detail = await detailRes.json();

      return {
        id: detail.id,
        name: detail.name,
        sprite: detail.sprites.other["official-artwork"].front_default,
        types: detail.types.map(t => t.type.name)
      };
    })
  );

  return detailed;
}

export async function fetchPokemonByName(name) {
  const url = `https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`;

  const res = await fetch(url);
  if (!res.ok) return null;

  const detail = await res.json();

  return {
    id: detail.id,
    name: detail.name,
    sprite: detail.sprites.other["official-artwork"].front_default,
    types: detail.types.map(t => t.type.name)
  };
}
