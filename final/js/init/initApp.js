import { initUI } from './initUI.js';
import { initData } from './initData.js';
import { initStorage } from './initStorage.js';
import { initFilters } from './initFilters.js';
import { initListeners } from './initListeners.js';
import { registerServiceWorker } from '../sw-register.js';

export async function initApp() {
  console.log('Initializing Pokédex Explorer...');
  initUI();
  initStorage();
  initFilters();
  initListeners();
  registerServiceWorker();
  await initData();
}
