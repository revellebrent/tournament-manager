import { getJSON, setJSON } from "./storage";

const K = {
  USERS: "tm_users",
  DOCS: "tm_documents",
  SHARES: "tm_shares",
  TEAMS: "tm_teams",
  APPS: "tm_applications",
  ROSTERS: "tm_roster_submissions",
  BRACKETS: "tm_brackets",
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
  ensureKey(K.TEAMS, []);
  ensureKey(K.APPS, []);
  ensureKey(K.ROSTERS, []);
  ensureKey(K.BRACKETS, []);
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

export function createTeam({ coachEmail, name, ageGroup }) {
  const teams = getJSON(K.TEAMS, []);
  const team = {
    id: uuid(),
    coachEmail,
    name,
    ageGroup,
    players: [],
    createdAt: Date.now(),
  };
  setJSON(K.TEAMS, [team, ...teams]);
  return team;
}

export function listTeamsByCoach(coachEmail) {
  const teams = getJSON(K.TEAMS, []);
  return teams.filter((t) => t.coachEmail === coachEmail);
}

export function renameTeam(teamId, name) {
  const teams = getJSON(K.TEAMS, []);
  const i = teams.findIndex((t) => t.id === teamId);
  if (i >= 0) {
    teams[i] = { ...teams[i], name };
    setJSON(K.TEAMS, teams);
  }
}

export function addPlayerToTeam(teamId, player) {
  const teams = getJSON(K.TEAMS, []);
  const i = teams.findIndex((t) => t.id === teamId);
  if (i >= 0) {
    const p = {
      id: uuid(),
      name: player.name,
      jersey: player.jersey || "",
      dob: player.dob || "",
      cardDocId: player.cardDocId || null,
    };
    teams[i] = { ...teams[i], players: [p, ...(teams[i].players || [])] };
    setJSON(K.TEAMS, teams);
    return p;
  }
  return null;
}

export function removePlayerFromTeam(teamId, playerId) {
  const teams = getJSON(K.TEAMS, []);
  const i = teams.findIndex((t) => t.id === teamId);
  if (i >= 0) {
    teams[i] = {
      ...teams[i],
      players: (teams[i].players || []).filter((p) => p.id !== playerId),
    };
    setJSON(K.TEAMS, teams);
  }
}

export function setPlayerCard(teamId, playerId, documentId) {
  const teams = getJSON(K.TEAMS, []);
  const i = teams.findIndex((t) => t.id === teamId);
  if (i >= 0) {
    teams[i] = {
      ...teams[i],
      players: teams[i].players.map((p) =>
        p.id === playerId ? { ...p, cardDocId: documentId } : p
      ),
    };
    setJSON(K.TEAMS, teams);
  }
}

export function getTeamById(teamId) {
  const teams = getJSON(K.TEAMS, []);
  return teams.find((t) => t.id === teamId) || null;
}

export function submitApplication({
  tournamentId,
  teamId,
  coachEmail,
  tier,
  poolPref = "",
}) {
  const apps = getJSON(K.APPS, []);
  const app = {
    id: uuid(),
    tournamentId,
    teamId,
    coachEmail,
    tier,
    poolPref,
    status: "pending", // "pending" | "approved" | "rejected"
    createdAt: Date.now(),
    assigned: { tier: tier || "", pool: "" },
  };
  setJSON(K.APPS, [app, ...apps]);
  return app;
}

export function listApplicationsByCoach(coachEmail) {
  const apps = getJSON(K.APPS, []);
  return apps.filter((a) => a.coachEmail === coachEmail);
}

export function listApplicationsByTournament(tournamentId) {
  const apps = getJSON(K.APPS, []);
  return apps.filter((a) => a.tournamentId === tournamentId);
}

export function approveApplication(appId, { pool = "A" } = {}) {
  const apps = getJSON(K.APPS, []);
  const i = apps.findIndex((a) => a.id === appId);
  if (i >= 0) {
    apps[i] = {
      ...apps[i],
      status: "approved",
      assigned: { tier: apps[i].tier, pool },
    };
    setJSON(K.APPS, apps);
    return apps[i];
  }
  return null;
}

export function rejectApplication(appId, reason = "") {
  const apps = getJSON(K.APPS, []);
  const i = apps.findIndex((a) => a.id === appId);
  if (i >= 0) {
    apps[i] = { ...apps[i], status: "rejected", reason };
    setJSON(K.APPS, apps);
    return apps[i];
  }
  return null;
}

export function submitRoster({ teamId, tournamentId, coachEmail, toEmail, note = "" }) {
  const rosters = getJSON(K.ROSTERS, []);
  const rec = {
    id: uuid(),
    teamId,
    tournamentId,
    coachEmail,
    toEmail,
    note,
    createdAt: Date.now(),
  };
  setJSON(K.ROSTERS, [rec, ...rosters]);
  return rec;
}

export function listRostersForDirector(toEmail) {
  const rosters = getJSON(K.ROSTERS, []);
  return rosters.filter((r) => r.toEmail === toEmail);
}

export function createDivision({ tournamentId, name, tier, pool }) {
  const list = getJSON(K.BRACKETS, []);
  const division = {
    id: uuid(),
    tournamentId,
    name: name || `${tier} || "Tier"} • Pool ${pool || "-"}`,
    tier: tier || "",
    pool: pool || "",
    teamIds: [],
    matches: [],
    createdAt: Date.now(),
  };
  setJSON(K.BRACKETS, [division, ...list]);
  return division;
}

export function listDivisionsByTournament(tournamentId) {
  const list = getJSON(K.BRACKETS, []);
  return list.filter((d) => d.tournamentId === tournamentId);
}

export function addTeamToDivision(divisionId, teamId) {
  const list = getJSON(K.BRACKETS, []);
  const i = list.findIndex((d) => d.id === divisionId);
  if (i < 0) return null;
  const exists = (list[i].teamIds || []).includes(teamId);
  if (!exists) {
    list[i] = { ...list[i], teamIds: [...(list[i].teamIds || []), teamId] };
    setJSON(K.BRACKETS, list);
  }
  return list[i];
}

export function removeTeamFromDivision(divisionId, teamId) {
  const list = getJSON(K.BRACKETS, []);
  const i = list.findIndex((d) => d.id === divisionId);
  if (i < 0) return null;
  list[i] = {
    ...list[i],
    teamIds: (list[i].teamIds || []).filter((id) => id !== teamId),
  };
  setJSON(K.BRACKETS, list);
  return list[i];
}

export function generateRoundRobin(divisionId) {
  const list = getJSON(K.BRACKETS, []);
  const i = list.findIndex((d) => d.id === divisionId);
  if (i < 0) return null;
  const teamIds = list[i].teamIds || [];
  const matches = [];
  for (let a = 0; a < teamIds.length; a++) {
    for (let b = a + 1; b < teamIds.length; b++) {
      matches.push({ id: uuid(), aTeamId: teamIds[a], btTeamIds: teamIds[b], aScore: null, bScore: null });
    }
  }
  list[i] = { ...list[i], matches };
  setJSON(K.BRACKETS, list);
  return list[i];
}

export function listAllDivisions() {
  return getJSON(K.BRACKETS, []);
}


