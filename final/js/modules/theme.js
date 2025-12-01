import { getFromStorage, saveToStorage } from './storage.js';

export function initTheme() {
  const toggle = document.getElementById('theme-toggle');
  const saved = getFromStorage('pokedex_theme', 'light');
  document.documentElement.setAttribute('data-theme', saved);
  toggle.textContent = saved === 'dark' ? '☀️' : '🌙';
  toggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    saveToStorage('pokedex_theme', next);
    toggle.textContent = next === 'dark' ? '☀️' : '🌙';
  });
}
