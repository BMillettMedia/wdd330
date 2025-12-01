import { initUI } from './init/initUI.js';
import { initData } from './init/initData.js';
import { initStorage } from './init/initStorage.js';
import { initFilters } from './init/initFilters.js';
import { initListeners } from './init/initListeners.js';

export async function initApp() {
  console.log('Initializing Pokédex Explorer...');
  initUI();
  initStorage();
  initFilters();
  initListeners();
  await initData();
}
