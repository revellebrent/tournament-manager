import { useEffect, useMemo, useState } from "react";
import "./DirectorDashboard.css";
import { useAuth } from "../../context/AuthContext";
import {
  listSharesTo,
  getDocumentById,
  ensureUser,
  listApplicationsByTournament,
  approveApplication,
  rejectApplication,
  updateApplicationAssignment,
  getTeamById,
  listRostersForDirector,
} from "../../utils/db";
import { tournaments } from "../../utils/tournaments";

const POOLS = ["A", "B", "C", "D", "E", "F", "G", "H"];

export default function DirectorDashboard() {
  const { user, role } = useAuth();
  const email = user?.email;

  // Tournament to manage
  const [tournamentId, setTournamentId] = useState(tournaments[0]?.id || "");

  // Applications state
  const [apps, setApps] = useState([]);
  const [poolByApp, setPoolByApp] = useState({});

  // Roster submissions to this director
  const [rosters, setRosters] = useState([]);
  const [rosterFilterTid, setRosterFilterTid] = useState("");

  // Player card inbox
  const [inbox, setInbox] = useState([]);

  useEffect(() => {
    if (!email) return;
    ensureUser({ email, role, name: user?.name });

    // Player card inbox for director
    const items = listSharesTo(email).map((s) => ({
      ...s,
      doc: getDocumentById(s.documentId),
    }));
    setInbox(items);

    // Rosters for director
    setRosters(listRostersForDirector(email));
  }, [email, role, user?.name]);

  useEffect(() => {
    if (!tournamentId) return;
    setApps(listApplicationsByTournament(tournamentId));
  }, [tournamentId]);

  function refreshApps() {
    setApps(listApplicationsByTournament(tournamentId));
  }

  function handleApprove(id) {
    const pool = poolByApp[id] || "A"; // default to A
    approveApplication(id, { pool });
    setPoolByApp((m) => {
      const { [id]: _omit, ...rest } = m;
      return rest;
    });
    refreshApps();
  }

  function handleReject(id) {
    const reason = window.prompt("Optional reason to include:", "");
    rejectApplication(id, reason || "");
    refreshApps();
  }

  function handleEditAssignment(appId, next) {
    updateApplicationAssignment(appId, next);
    refreshApps();
  }

  const pending = useMemo(
    () => apps.filter((a) => a.status === "pending"),
    [apps]
  );
  const approved = useMemo(
    () => apps.filter((a) => a.status === "approved"),
    [apps]
  );
  const rejected = useMemo(
    () => apps.filter((a) => a.status === "rejected"),
    [apps]
  );

  const filteredRosters = useMemo(
    () =>
      rosters.filter(
        (r) => !rosterFilterTid || r.tournamentId === rosterFilterTid
      ),
    [rosters, rosterFilterTid]
  );

  if (!email) return null;

  return (
    <main className="director container">
      <h1 className="director__title">Director Dashboard</h1>

      {/* Applications */}
      <section className="section">
        <h2 className="director__h2">Tournament Applications</h2>

        <label className="field director__select">
          <span className="field__label">Tournament</span>
          <select
            className="field__input"
            value={tournamentId}
            onChange={(e) => setTournamentId(e.target.value)}
          >
            {tournaments.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>

        <div className="director__apps">
          {/* Pending Applications */}
          <h3 className="director__h3">Pending</h3>
          {pending.length === 0 ? (
            <p className="director__muted">No pending applications.</p>
          ) : (
            <ul className="director__applist">
              {pending.map((a) => {
                const team = getTeamById(a.teamId);
                const poolValue = poolByApp[a.id] ?? a.poolPref ?? "A";
                return (
                  <li key={a.id} className="director__app">
                    <div className="director__appmeta">
                      <strong>{team?.name || "Team"}</strong> —{" "}
                      {team?.ageGroup || "Age Group"}
                      {a.tier ? ` • Tier: ${a.tier}` : ""}
                      {a.poolPref ? ` • Pool pref: ${a.poolPref}` : ""}
                      <div className="director__appsub">
                        Coach: {a.coachEmail}
                      </div>
                    </div>
                    <div className="director__appactions">
                      <label className="director__label">
                        Pool:
                        <select
                          className="field__input"
                          value={poolValue}
                          onChange={(e) =>
                            setPoolByApp((m) => ({
                              ...m,
                              [a.id]: e.target.value,
                            }))
                          }
                        >
                          {POOLS.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                      </label>
                      <button
                        className="button"
                        type="button"
                        onClick={() => handleApprove(a.id)}
                      >
                        Approve
                      </button>
                      <button
                        className="button"
                        type="button"
                        onClick={() => handleReject(a.id)}
                      >
                        Reject
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Approved Applications */}
          <h3 className="director__h3">Approved</h3>
          {approved.length === 0 ? (
            <p className="director__muted">No approved applications.</p>
          ) : (
            <ul className="director__applist">
              {approved.map((a) => {
                const team = getTeamById(a.teamId);
                return (
                  <li key={a.id} className="director__app">
                    <div className="director__appmeta">
                      <strong>{team?.name || "Team"}</strong> —{" "}
                      {team?.ageGroup || "Age Group"}
                      {a.assigned?.tier ? ` • Tier: ${a.assigned.tier}` : ""}
                      {a.assigned?.pool ? ` • Pool: ${a.assigned.pool}` : ""}
                    </div>
                    <div className="director__appactions">
                      <label className="director__label">
                        Pool:
                        <select
                          className="field__input"
                          value={a.assigned?.pool || "A"}
                          onChange={(e) =>
                            handleEditAssignment(a.id, { pool: e.target.value })
                          }
                        >
                          {POOLS.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Rejected Applications */}
          <h3 className="director__h3">Rejected</h3>
          {rejected.length === 0 ? (
            <p className="director__muted">No rejected applications.</p>
          ) : (
            <ul className="director__applist">
              {rejected.map((a) => {
                const team = getTeamById(a.teamId);
                return (
                  <li key={a.id} className="director__app">
                    <div className="director__appmeta">
                      <strong>{team?.name || "Team"}</strong> —{" "}
                      {team?.ageGroup || "Age Group"}
                      {a.tier ? ` • Tier: ${a.tier}` : ""}
                      {a.reason ? ` • Reason: ${a.reason}` : ""}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {/* Roster Submissions */}
      <section className="section">
        <h2 className="director__h2">Roster Submissions</h2>

        <label className="field director__select">
          <span className="field__label">Filter by Tournament</span>
          <select
            className="field__input"
            value={rosterFilterTid}
            onChange={(e) => setRosterFilterTid(e.target.value)}
          >
            <option value="">All tournaments</option>
            {tournaments.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>

        {filteredRosters.length === 0 ? (
          <p className="director__muted">No roster submissions.</p>
        ) : (
          <ul className="director__rosters">
            {filteredRosters.map((r) => {
              const team = getTeamById(r.teamId);
              const tMeta = tournaments.find((t) => t.id === r.tournamentId);
              return (
                <li key={r.id} className="director__roster">
                  <div className="director__rmeta">
                    <strong>{team?.name || "Team"}</strong> —{" "}
                    {team?.ageGroup || ""}
                    {tMeta ? ` • ${tMeta.name}` : ""} • Coach: {r.coachEmail}
                    <div className="director__rsub">
                      Sent: {new Date(r.createdAt).toLocaleString()}
                    </div>
                  </div>
                  {team?.players?.length ? (
                    <ul className="director__players">
                      {team.players.map((p) => (
                        <li key={p.id} className="director__player">
                          <span>
                            <strong>{p.name}</strong>
                            {p.jersey ? ` #${p.jersey}` : ""}{" "}
                            {p.dob ? `• ${p.dob}` : ""}
                          </span>
                          {p.cardDocId ? (
                            <CardLink docId={p.cardDocId} />
                          ) : (
                            <span className="director__tag director__tag--warn">
                              no card
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="director__muted">No players on this team.</p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Player Card Inbox */}
      <section className="section">
        <h2 className="director__h2">Player Card Inbox</h2>
        {inbox.length === 0 ? (
          <p className="director__muted">No player cards received yet.</p>
        ) : (
          <ul className="director__list">
            {inbox.map((i) => (
              <li key={i.id} className="director__item">
                <div className="director__meta">
                  From: {i.fromEmail} &middot; Doc:{" "}
                  <strong>{i.doc?.name}</strong>
                </div>
                {i.doc?.mime === "image/jpeg" && (
                  <img
                    className="director__preview"
                    src={i.doc.dataUrl}
                    alt="Player card"
                  />
                )}
                {i.doc?.mime === "application/pdf" && (
                  <object
                    className="director__preview"
                    data={i.doc.dataUrl}
                    type="application/pdf"
                    aria-label="Player card PDF"
                  />
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function CardLink({ docId }) {
  const doc = getDocumentById(docId);
  if (!doc) {
    return (
      <span className="director__tag director__tag--warn">missing card</span>
    );
  }
  const label = doc.mime === "application/pdf" ? "View PDF" : "View image";
  return (
    <span className="director__tag">
      <a
        className="director__cardlink"
        href={doc.dataUrl}
        target="_blank"
        rel="noreferrer"
        download={doc.name}
      >
        {label}
      </a>
    </span>
  );
}
