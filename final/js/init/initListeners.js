export function initListeners() {
  document.addEventListener('favoritesUpdated', () => {
    console.log('Favorites updated.');
  });

  window.addEventListener('online', () => console.log('Online'));
  window.addEventListener('offline', () => console.warn('Offline'));
}
