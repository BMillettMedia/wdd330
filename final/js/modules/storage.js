// js/modules/storage.js

export function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('Storage save error:', err);
  }
}

export function getFromStorage(key, defaultValue = null) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : defaultValue;
  } catch {
    return defaultValue;
  }
}
