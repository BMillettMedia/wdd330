export function initOfflineMode() {
  window.addEventListener('offline', () => console.warn('Offline mode active.'));
}
