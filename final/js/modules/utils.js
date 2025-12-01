export function handleError(err) {
  console.error(err);
  const grid = document.getElementById('pokedex-grid');
  if (grid) grid.innerHTML = `<div class="error">Error loading data. Try refreshing.</div>`;
}

export function capitalize(s) {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
