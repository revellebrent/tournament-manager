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
  getTeamById,
} from "../../utils/db";
import { tournaments } from "../../utils/tournaments";

export default function DirectorDashboard() {
  const { user, role } = useAuth();
  const email = user?.email;

  // Player card inbox
  const [inbox, setInbox] = useState([]);

  // Applications state
  const [tournamentId, setTournamentId] = useState(tournaments[0]?.id || "");
  const [apps, setApps] = useState([]);

  useEffect(() => {
    if (!email) return;
    ensureUser({ email, role, name: user?.name });

    // Player card inbox for director
    const items = listSharesTo(email).map((s) => ({
      ...s,
      doc: getDocumentById(s.documentId),
    }));
    setInbox(items);
  }, [email, role, user?.name]);

  useEffect(() => {
    if (!tournamentId) return;
    setApps(listApplicationsByTournament(tournamentId));
  }, [tournamentId]);

  function refreshApps() {
    setApps(listApplicationsByTournament(tournamentId));
  }

  function handleApprove(id) {
    approveApplication(id, { pool: "A" }); // Default to pool A
    refreshApps();
  }

  function handleReject(id) {
    rejectApplication(id, "Not a fit/ division full");
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
                  From: {i.fromEmail} &middot; Doc: <strong>{i.doc?.name}</strong>
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
