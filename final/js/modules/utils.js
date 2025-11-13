// js/modules/utils.js

export function handleError(error) {
  console.error('❌', error.message);
  const grid = document.querySelector('#pokedex-grid');
  if (grid) {
    grid.innerHTML = `<p class="error">Error loading data. Try refreshing!</p>`;
  }
}

export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
