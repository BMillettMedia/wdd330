// js/modules/router.js

export function navigateTo(view) {
  document.querySelectorAll('[data-view]').forEach((v) => {
    v.style.display = v.dataset.view === view ? 'block' : 'none';
  });
}
