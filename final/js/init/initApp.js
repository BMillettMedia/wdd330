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


export function initApp() {
  console.log("App init…");

  loadTheme();
  attachListeners();

  // DEFAULT LOAD — ALWAYS SHOW POKÉDEX PAGE 1
  loadPokemonPage(1);
}