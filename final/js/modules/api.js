// js/modules/api.js
import { handleError } from './utils.js';

const BASE_URL = 'https://pokeapi.co/api/v2/pokemon';

export async function loadPokemonList(limit = 151, offset = 0) {
  try {
    const response = await fetch(`${BASE_URL}?limit=${limit}&offset=${offset}`);
    if (!response.ok) throw new Error('Failed to fetch Pokémon list.');

    const data = await response.json();
    const detailedPokemon = await Promise.all(
      data.results.map(async (pokemon) => {
        const detailRes = await fetch(pokemon.url);
        if (!detailRes.ok) throw new Error(`Failed to fetch ${pokemon.name}`);
        const details = await detailRes.json();

        return {
          id: details.id,
          name: details.name,
          types: details.types.map((t) => t.type.name),
          sprite: details.sprites.other['official-artwork'].front_default,
        };
      })
    );

    return detailedPokemon;
  } catch (err) {
    handleError(err);
    return [];
  }
}
