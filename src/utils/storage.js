export function getJSON(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}
export function setJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}