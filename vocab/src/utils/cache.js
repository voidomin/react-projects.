const STORAGE_KEY = "vocab_items_v1";

export function loadItems() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("loadItems", e);
    return [];
  }
}

export function saveItems(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error("saveItems", e);
  }
}

export function exportJSON(items) {
  return JSON.stringify(items, null, 2);
}

export function importJSON(raw) {
  try {
    return JSON.parse(raw);
  } catch (e) {
    throw new Error("Invalid JSON");
  }
}
