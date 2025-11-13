// js/modules/theme.js

export function initTheme() {
  const saved = localStorage.getItem('theme');
  if (saved) document.body.dataset.theme = saved;

  document
    .getElementById('theme-toggle')
    ?.addEventListener('click', toggleTheme);
}

export function toggleTheme() {
  const current = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
  document.body.dataset.theme = current;
  localStorage.setItem('theme', current);
}
