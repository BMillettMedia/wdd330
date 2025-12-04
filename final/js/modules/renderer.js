import { capitalize, extractIdFromUrl, officialArtworkUrl } from './utils.js';
import { openDetail } from './modal.js';
import { isFavorite, toggleFavorite } from './favorites.js';

export function createCardFromSummary(item) {
  const id = extractIdFromUrl(item.url);
  const name = capitalize(item.name);
  const sprite = officialArtworkUrl(id); // fast immediate artwork

  const template = document.getElementById('pokemonCardTemplate');
  const card = template.content.cloneNode(true);
  const article = card.querySelector('.pokemon-card');
  const img = card.querySelector('.sprite');
  const nameEl = card.querySelector('.name');
  const idEl = card.querySelector('.id');
  const typesWrap = card.querySelector('.types');
  const favBtn = card.querySelector('.favBtn');

  img.src = sprite;
  img.alt = name;
  nameEl.textContent = name;
  idEl.textContent = `#${String(id).padStart(3,'0')}`;

  // types will be populated later when details fetched; leave blank for now
  typesWrap.innerHTML = '';

  favBtn.textContent = isFavorite(id) ? '★' : '☆';
  favBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleFavorite(id);
    favBtn.textContent = isFavorite(id) ? '★' : '☆';
  });

  article.addEventListener('click', () => openDetail(id, item.name));

  return card;
}
