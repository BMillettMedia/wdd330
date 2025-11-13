export function initListeners() {
  console.log('🎧 Registering global listeners...');
  
  document.addEventListener('favoritesUpdated', () => {
    console.log('⭐ Favorites updated!');
  });

  window.addEventListener('offline', () => {
    console.warn('⚠️ Offline mode activated.');
  });

  window.addEventListener('online', () => {
    console.log('🌐 Online connection restored.');
  });
}
