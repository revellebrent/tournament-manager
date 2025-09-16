import { getJSON, setJSON } from "./storage";

const K = {
  USERS: "tm_users",
  DOCS: "tm_documents",
  SHARES: "tm_shares",
};

function uuid() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `id_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function ensureKey(key, fallback) {
  if (getJSON(key, null) === null) setJSON(key, fallback);
}

function ensureSeedUsers() {
  const users = getJSON(K.USERS, []);
  const ensure = (email, role, name) => {
    if (!users.find((u) => u.email === email))
      users.push({ email, role, name });
  };
  ensure("coach@example.com", "coach", "Coach Demo");
  ensure("director@example.com", "director", "Director Demo");
  setJSON(K.USERS, users);
}

(function init() {
  ensureKey(K.USERS, []);
  ensureKey(K.DOCS, []);
  ensureKey(K.SHARES, []);
  ensureSeedUsers();
})();

export function ensureUser({ email, role = "parent", name = "User" }) {
  if (!email) return null;
  const users = getJSON(K.USERS, []);
  const i = users.findIndex((u) => u.email === email);
  if (i === -1) {
    users.push({ email, role, name });
    setJSON(K.USERS, users);
  }
  return email;
}

export function upsertUserRole(email, role) {
  if (!email) return;
  const users = getJSON(K.USERS, []);
  const i = users.findIndex((u) => u.email === email);
  if (i >= 0) {
    users[i] = { ...users[i], role };
  } else {
    users.push({ email, role, name: email.split("@")[0] || "User" });
  }
  setJSON(K.USERS, users);
}

export function listUsersByRole(role) {
  const users = getJSON(K.USERS, []);
  return users.filter((u) => u.role === role);
}

export function addDocuments(ownerEmail, docs) {
  const all = getJSON(K.DOCS, []);
  const stamped = docs.map((d) => ({
    ...d,
    ownerEmail,
    id: uuid(),
    createdAt: Date.now(),
  }));
  setJSON(K.DOCS, [...stamped, ...all]);
  return stamped;
}

export function listDocumentsByOwner(ownerEmail) {
  const all = getJSON(K.DOCS, []);
  return all.filter((d) => d.ownerEmail === ownerEmail);
}

export function getDocumentById(id) {
  const all = getJSON(K.DOCS, []);
  return all.find((d) => d.id === id) || null;
}

export function shareDocument({
  fromEmail,
  toEmail,
  documentId,
  message = "",
}) {
  const shares = getJSON(K.SHARES, []);
  const record = {
    id: uuid(),
    fromEmail,
    toEmail,
    documentId,
    message,
    createdAt: Date.now(),
    status: "sent",
  };
  setJSON(K.SHARES, [record, ...shares]);
  return record;
}

export function listSharesTo(toEmail) {
  const shares = getJSON(K.SHARES, []);
  return shares.filter((s) => s.toEmail === toEmail);
}
