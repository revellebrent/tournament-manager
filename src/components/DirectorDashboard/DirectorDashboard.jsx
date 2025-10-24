import { Children, useEffect, useMemo, useState } from "react";

import { useAuth } from "../../context/AuthContext.jsx";
import {
  approveApplication,
  ensureUser,
  getDocumentById,
  getTeamById,
  listApplicationsByTournament,
  listDivisionsByTournament,
  listRostersForDirector,
  listSharesTo,
  rejectApplication,
  setDivisionPublished,
  updateApplicationAssignment,
} from "../../utils/db";
import { tournaments } from "../../utils/tournaments";
import DashboardPage from "../common/DashboardPage.jsx";
import Section from "../common/Section.jsx";

const TIER_OPTIONS = ["Gold", "Silver", "Bronze", "Custom"];
const POOLS = ["A", "B", "C", "D", "E", "F", "G", "H"];

export default function DirectorDashboard() {
  const { user, role } = useAuth();
  const email = user?.email;
  const isDirector = role === "director";

  // Tournament to manage
  const [tournamentId, setTournamentId] = useState(tournaments[0]?.id || "");

  //Quick Links & Publishing
  const [qlTid, setQlTid] = useState(tournaments[0]?.id || "");
  const [qlDivisions, setQlDivisions] = useState([]);

  useEffect(() => {
    if (!qlTid) return;
    setQlDivisions(listDivisionsByTournament(qlTid));
  }, [qlTid]);

  useEffect(() => {
    if (tournamentId) setQlTid(tournamentId);
  }, [tournamentId]);

  function refreshQuickLinks() {
    if (!qlTid) return;
    setQlDivisions(listDivisionsByTournament(qlTid));
  }

  function togglePublished(divId, checked) {
    setDivisionPublished(divId, !!checked);
    refreshQuickLinks();
  }

  const copyPublicLink = async (kind) => {
    if (!qlTid) return;
    const path =
      kind === "standings"
        ? `/public/${qlTid}/standings`
        : `/public/${qlTid}/schedule`;
    const url = `${window.location.origin}${path}`;
    try {
      if (!navigator.clipboard || !window.isSecureContext)
        throw new Error("no-async-clipboard");
      await navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    } catch {
      window.prompt("Copy this public link:", url);
    }
  };

  // Applications state
  const [apps, setApps] = useState([]);
  const [poolByApp, setPoolByApp] = useState({});
  const [tierByApp, setTierByApp] = useState({});

  // Roster submissions to this director
  const [rosters, setRosters] = useState([]);
  const [rosterFilterTid, setRosterFilterTid] = useState("");

  // Player card inbox
  const [inbox, setInbox] = useState([]);

  useEffect(() => {
    if (!email) return;
    ensureUser({ email, role, name: user?.name });

    setInbox(
      listSharesTo(email).map((s) => ({
        ...s,
        doc: getDocumentById(s.documentId),
      }))
    );
    setRosters(listRostersForDirector(email));
  }, [email, role, user?.name]);

  useEffect(() => {
    if (!tournamentId) return;
    setApps(listApplicationsByTournament(tournamentId));
    setPoolByApp({});
    setTierByApp({});
  }, [tournamentId]);

  const refreshApps = () => {
    setApps(listApplicationsByTournament(tournamentId));
  };

  const handleApprove = (id) => {
    const pool = poolByApp[id] || "A"; // default to A
    const tier = tierByApp[id]; // override
    approveApplication(id, { pool });
    if (tier) updateApplicationAssignment(id, { tier });
    setPoolByApp((prev) => {
      const { [id]: _omit, ...rest } = prev;
      return rest;
    });
    setTierByApp((prev) => {
      const { [id]: _omit, ...rest } = prev;
      return rest;
    });
    refreshApps();
  };

  const handleReject = (id) => {
    const reason = window.prompt("Optional reason to include:", "") || "";
    rejectApplication(id, reason);
    refreshApps();
  };

  const handleEditAssignment = (appId, next) => {
    updateApplicationAssignment(appId, next);
    refreshApps();
  };

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

  if (!email || !isDirector) return null;

  return (
    <DashboardPage
      title="Director Dashboard"
      toolbar={
        <label className="field field--min">
          <span className="field__label">Tournament</span>
          <select
            className="field__input"
            value={tournamentId}
            onChange={(e) => setTournamentId(e.target.value)}
            aria-label="Select tournament to manage"
          >
            {tournaments.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
      }
    >
      {/* Applications */}
      <Section title="Tournament Applications">
        <div className="grid-3col">
          <AppColumn
            title="Pending"
            count={pending.length}
            empty="No pending applications."
          >
            {pending.map((a) => {
              const team = getTeamById(a.teamId);
              const poolValue = poolByApp[a.id] ?? a.poolPref ?? "A";
              const tierValue = tierByApp[a.id] ?? a.tier ?? "Gold";
              return (
                <li key={a.id} className="card-row">
                  <div className="card-row__meta">
                    <strong>{team?.name || "Team"}</strong> —{" "}
                    {team?.ageGroup || "Age Group"}
                    {a.tier ? ` • Tier: ${a.tier}` : ""}
                    {a.poolPref ? ` • Pool pref: ${a.poolPref}` : ""}
                    <div className="sub">Coach: {a.coachEmail}</div>
                  </div>
                  <div className="row-actions">
                    <label className="field">
                      <span className="field__label">Tier</span>
                      <select
                        className="field__input"
                        value={tierValue}
                        onChange={(e) =>
                          setTierByApp((m) => ({
                            ...m,
                            [a.id]: e.target.value,
                          }))
                        }
                      >
                        {TIER_OPTIONS.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="field">
                      <span className="field__label">Pool</span>
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
          </AppColumn>

          <AppColumn
            title="Approved"
            count={approved.length}
            empty="No approved applications."
          >
            {approved.map((a) => {
              const team = getTeamById(a.teamId);
              return (
                <li key={a.id} className="card-row">
                  <div className="card-row__meta">
                    <strong>{team?.name || "Team"}</strong> —{" "}
                    {team?.ageGroup || "Age Group"}
                    {a.assigned?.tier ? ` • Tier: ${a.assigned.tier}` : ""}
                    {a.assigned?.pool ? ` • Pool: ${a.assigned.pool}` : ""}
                  </div>
                  <div className="row-actions">
                    <label className="field">
                      <span className="field__label">Tier:</span>
                      <select
                        className="field__input"
                        value={a.assigned?.tier || a.tier || "Gold"}
                        onChange={(e) =>
                          handleEditAssignment(a.id, {
                            tier: e.target.value,
                          })
                        }
                      >
                        {TIER_OPTIONS.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="field">
                      <span className="field__label">Pool:</span>
                      <select
                        className="field__input"
                        value={a.assigned?.pool || "A"}
                        onChange={(e) =>
                          handleEditAssignment(a.id, {
                            pool: e.target.value,
                          })
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
          </AppColumn>

          <AppColumn
            title="Rejected"
            count={rejected.length}
            empty="No rejected applications."
          >
            {rejected.map((a) => {
              const team = getTeamById(a.teamId);
              return (
                <li key={a.id} className="card-row">
                  <div className="card-row__meta">
                    <strong>{team?.name || "Team"}</strong> —{" "}
                    {team?.ageGroup || "Age Group"}
                    {a.tier ? ` • Tier: ${a.tier}` : ""}
                    {a.reason ? ` • Reason: ${a.reason}` : ""}
                  </div>
                </li>
              );
            })}
          </AppColumn>
        </div>
      </Section>

      {/* Roster Submissions */}
      <Section
        title="Roster Submissions"
        actions={
          <label className="field field--min">
            <span className="field__label">Filter by Tournament</span>
            <select
              className="field__input"
              value={rosterFilterTid}
              onChange={(e) => setRosterFilterTid(e.target.value)}
            >
              <option value="">-- All Tournaments --</option>
              {tournaments.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
        }
      >
        {filteredRosters.length === 0 ? (
          <p className="muted">No roster submissions.</p>
        ) : (
          <ul className="list">
            {filteredRosters.map((r) => {
              const team = getTeamById(r.teamId);
              const tMeta = tournaments.find((t) => t.id === r.tournamentId);
              return (
                <li key={r.id} className="card">
                  <div className="card-row__meta">
                    <strong>{team?.name || "Team"}</strong> —{" "}
                    {team?.ageGroup || ""}
                    {tMeta ? ` • ${tMeta.name}` : ""} • Coach: {r.coachEmail}
                    <div className="sub">
                      Sent: {new Date(r.createdAt).toLocaleString()}
                    </div>
                  </div>
                  {team?.players?.length ? (
                    <ul className="list compact">
                      {team.players.map((p) => (
                        <li key={p.id} className="card-row compact">
                          <span>
                            <strong>{p.name}</strong>
                            {p.jersey ? ` #${p.jersey}` : ""}{" "}
                            {p.dob ? `• ${p.dob}` : ""}
                          </span>
                          {p.cardDocId ? (
                            <CardLink docId={p.cardDocId} />
                          ) : (
                            <span className="tag warn">no card</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="muted">No players on this team.</p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      {/* Player Card Inbox */}
      <Section title="Player Card Inbox">
        {inbox.length === 0 ? (
          <p className="muted">No player cards received yet.</p>
        ) : (
          <ul className="list">
            {inbox.map((i) => (
              <li key={i.id} className="card">
                <div className="card-row__meta">
                  From: {i.fromEmail} &middot; Doc:{" "}
                  <strong>{i.doc?.name}</strong>
                </div>
                {i.doc?.mime === "image/jpeg" && (
                  <img
                    className="preview"
                    src={i.doc.dataUrl}
                    alt="Player card"
                    loading="lazy"
                  />
                )}
                {i.doc?.mime === "application/pdf" && (
                  <object
                    className="preview"
                    data={i.doc.dataUrl}
                    type="application/pdf"
                    aria-label="Player card PDF"
                  />
                )}
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* Quick Links & Publishing */}
      <Section
        title="Quick Links & Publishing"
        actions={
          <>
            <button
              className="button"
              type="button"
              onClick={() => copyPublicLink("schedule")}
            >
              Copy Public Schedule
            </button>
            <button
              className="button"
              type="button"
              onClick={() => copyPublicLink("standings")}
            >
              Copy Public Standings
            </button>
          </>
        }
      >
        <div className="section__toolbar">
          <label className="field field--min">
            <span className="field__label">Tournament</span>
            <select
              className="field__input"
              value={qlTid}
              onChange={(e) => setQlTid(e.target.value)}
              aria-label="Select tournament to manage"
            >
              {tournaments.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        {qlDivisions.length === 0 ? (
          <p className="muted">No divisions for this tournament yet.</p>
        ) : (
          <ul className="list compact">
            {qlDivisions.map((d) => (
              <li key={d.id} className="card-row compact">
                <div className="card-row__meta">
                  <strong>{d.name}</strong>
                  {d.tier ? <span> • {d.tier}</span> : null}
                  {d.pool ? <span> • Pool {d.pool}</span> : null}
                </div>
                <label className="inline">
                  <input
                    type="checkbox"
                    aria-label={`Toggle published for ${d.name}`}
                    checked={!!d.published}
                    onChange={(e) => togglePublished(d.id, e.target.checked)}
                  />
                  <span style={{ marginLeft: 6 }}>Published</span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </DashboardPage>
  );
}

function AppColumn({ title, count, empty, children }) {
  const hasItems = Children.toArray(children).length > 0;

  return (
    <div>
      <h3 className="section__h2">
        {title} <span className="pill">{count}</span>
      </h3>
      {hasItems ? (
        <ul className="list">{children}</ul>
      ) : (
        <p className="muted">{empty}</p>
      )}
    </div>
  );
}

function CardLink({ docId }) {
  const doc = getDocumentById(docId);
  if (!doc) return <span className="tag warn">missing card</span>;
  const label = doc.mime === "application/pdf" ? "View PDF" : "View image";
  return (
    <span className="tag">
      <a
        className="cardlink"
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
