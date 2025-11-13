import { initUI } from './initUI.js';
import { initData } from './initData.js';
import { initStorage } from './initStorage.js';
import { initFilters } from './initFilters.js';
import { initListeners } from './initListeners.js';

export async function initApp() {
  console.log('🚀 Starting Pokédex Explorer...');
  initUI();
  initStorage();
  initFilters();
  initListeners();
  await initData();
}
