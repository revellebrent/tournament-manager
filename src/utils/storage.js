export function getJSON(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

export function setJSON(key, value) {
  try {
  localStorage.setItem(key, JSON.stringify(value));
} catch {
  // Swallow JSON/localStore errors and return fallback
}
}
