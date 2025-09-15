import { getJSON, setJSON } from "./storage";

const K = {
  USERS: "tm_users",
  DOCS: "tm_documents",
  SHARES: "tm_shares",
};

function initSeed() {
  const users = getJSON(K.USERS, []);
  if (users.length === 0) {
    const seed = [
      { email: "coach@example.com", role: "coach", name: "Coach Demo" },
      { email: "director@example.com", role: "director", name: "Director Demo" },
    ];
    setJSON(K.USERS, seed);
  }
  if (!getJSON(K.DOCS, null)) setJSON(K.DOCS, []);
  if (!getJSON(K.SHARES, null)) setJSON(K.SHARES, []);
}
initSeed();

export function ensureUser({ email, role = "parent", name = "User" }) {
  if (!email) return null;
  const users = getJSON(K.USERS, []);
  const exists = users.find(u => u.email === email);
  if (!exists) {
    users.push({ email, role, name });
    setJSON(K.USERS, users);
  }
  return email;
}

export function listUsersByRole(role) {
  const users = getJSON(K.USERS, []);
  return users.filter(u => u.role === role);
}

export function upsertUsersByRole(email, role) {
  if (!email) return;
  const users = getJSON(K.USERS, []);
  const i = users.findIndex(u => u.email === email);
  if (i >= 0) users[i] = { ...users[i], role };
  else users.push({email, role, name: email.split("@")[0] });
  setJSON(K.USERS, users);
}

export function addDocuments(ownerEmail, docs) {
  const all = getJSON(K.DOCS, []);
  const stamped = docs.maap(d => ({ ...d, ownerEmail, id: crypto.randomUUID(), createdAt: Date.now() }));
  setJSON(K.DOCS, [...stamped, ...all]);
  return stamped;
}

export function listDocumentsByOwner(ownerEmail) {
  const all = getJSON(K.DOCS, []);
  return all.filter(d => d.ownerEmail === ownerEmail);
}

export function shareDocument({ fromEmail, toEmail, documentId, message = "" }) {
  const shares = getJSON(K.SHARES, []);
  const record = {
    id: crypto.randomUUID(),
    fromEmail, toEmail, documentId, message,
    createdAt: Date.now(), status: "sent",
  };
  setJSON(K.SHARES, [record, ...shares]);
  return record;
}

export function listSharesTo(toEmail) {
  const shares = getJSON(K.SHARES, []);
  return shares.filter(s => s.toEmail === toEmail);
}

export function getDocumentById(id) {
  const all = getJSON(K.DOCS, []);
  return all.find(d => d.id === id) || null;
}

