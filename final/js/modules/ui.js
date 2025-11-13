// js/modules/ui.js
import { toggleFavorite, isFavorite } from './favorites.js';

export function renderPokemonGrid(pokemonList) {
  const grid = document.querySelector('#pokedex-grid');
  if (!grid) return;

  grid.innerHTML = '';

  pokemonList.forEach((pokemon) => {
    const card = document.createElement('div');
    card.classList.add('pokemon-card');
    card.innerHTML = `
      <img src="${pokemon.sprite}" alt="${pokemon.name}">
      <h3>${capitalize(pokemon.name)}</h3>
      <p>${pokemon.types.join(', ')}</p>
      <button class="fav-btn" data-id="${pokemon.id}">
        ${isFavorite(pokemon.id) ? '★' : '☆'}
      </button>
    `;

    card.querySelector('.fav-btn').addEventListener('click', (e) => {
      toggleFavorite(pokemon.id);
      e.target.textContent = isFavorite(pokemon.id) ? '★' : '☆';
    });

    grid.appendChild(card);
  });
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
