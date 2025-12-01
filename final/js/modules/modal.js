// modules/modal.js

import { getPokemonById } from './api.js';

const modal = document.getElementById('pokemonModal');
const modalBody = document.getElementById('modalBody');
const closeBtn = document.getElementById('modalClose');

export async function openPokemonModal(id) {
  const pokemon = await getPokemonById(id);

  const art =
    pokemon.sprites?.other?.['official-artwork']?.front_default ||
    pokemon.sprites?.front_default;

  modalBody.innerHTML = `
    <h2 class="modal-title">${pokemon.name}</h2>

    <div class="modal-art">
      <img src="${art}" alt="${pokemon.name}">
    </div>

    <div class="modal-types">
      ${pokemon.types
        .map(t => `<span class="typeBadge type-${t.type.name}">${t.type.name}</span>`)
        .join('')}
    </div>

    <h3>Base Stats</h3>
    <div class="stat-list">
      ${pokemon.stats
        .map(stat => `
          <div class="statBar">
            <span class="label">${stat.stat.name}</span>
            <div class="bar"><i style="width:${stat.base_stat / 2}%"></i></div>
          </div>
        `)
        .join('')}
    </div>
  `;

  modal.classList.remove('hidden');
}

// Close modal
closeBtn.addEventListener('click', () => {
  modal.classList.add('hidden');
});

// Click outside closes modal
modal.addEventListener('click', (e) => {
  if (e.target === modal) modal.classList.add('hidden');
});
