export function initOfflineMode() {
  // register service worker done elsewhere; here you can add offline UX hooks
  window.addEventListener('offline', () => {
    console.warn('Offline mode active.');
  });
}
