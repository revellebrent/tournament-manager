import { useEffect, useMemo, useState } from "react";

import { useAuth } from "../../context/AuthContext.jsx";
import {
  ensureUser,
  getDocumentById,
  getTeamById,
  listApplicationsByCoach,
  listRostersByCoach,
  listSharesTo,
  listTeamsByCoach,
  listUsersByRole,
  shareDocument,
  submitRoster,
} from "../../utils/db";
import { tournaments } from "../../utils/tournaments";
import ApplyForm from "../ApplyForm/ApplyForm.jsx";
import DashboardPage from "../common/DashboardPage.jsx";
import Section from "../common/Section.jsx";
import TeamManager from "../TeamManager/TeamManager.jsx";
import "./CoachDashboard.css";

export default function CoachDashboard() {
  const { user, role } = useAuth();
  const email = user?.email;

  // Inbox & directors
  const [inbox, setInbox] = useState([]);
  const directors = useMemo(() => listUsersByRole("director"), []);
  const [toDirector, setToDirector] = useState(directors[0]?.email || "");

  // Teams / applications/ rosters
  const [teams, setTeams] = useState([]);
  const [apps, setApps] = useState([]);
  const [rosters, setRosters] = useState([]);

  // Send roster form
  const [form, setForm] = useState({
    teamId: "",
    tournamentId: tournaments[0]?.id || "",
    toEmail: tournaments[0]?.directorEmail || "director@example.com",
    note: "",
    sent: false,
  });

  // default a director if list loads later
  useEffect(() => {
    if (!toDirector && directors[0]?.email) {
      setToDirector(directors[0].email);
    }
  }, [directors, toDirector]);

  useEffect(() => {
    if (!email) return;
    ensureUser({ email, role, name: user?.name });

    // inbox
    const items = listSharesTo(email).map((s) => ({
      ...s,
      doc: getDocumentById(s.documentId),
    }));
    setInbox(items);

    // coach data
    const tms = listTeamsByCoach(email);
    setTeams(tms);
    setApps(listApplicationsByCoach(email));
    setRosters(listRostersByCoach(email));

    // defaults for form
    setForm((f) => ({
      ...f,
      teamId: f.teamId || tms[0]?.id || "",
      toEmail:
        tournaments.find((t) => t.id === f.tournamentId)?.directorEmail ||
        f.toEmail,
    }));
  }, [email, role, user?.name]);

  // update suggested director email when tournament changes
  useEffect(() => {
    if (!form.tournamentId) return;
    const meta = tournaments.find((t) => t.id === form.tournamentId);
    if (meta?.directorEmail) {
      setForm((f) => ({ ...f, toEmail: meta.directorEmail }));
    }
  }, [form.tournamentId]);

  function refreshCoachData() {
    if (!email) return;
    setApps(listApplicationsByCoach(email));
    setRosters(listRostersByCoach(email));
  }

  function forwardDocument(docId) {
    if (!toDirector) return;
    shareDocument({
      fromEmail: email,
      toEmail: toDirector,
      documentId: docId,
      message: "Coach forwarded player card",
    });
    alert("Forwarded to director");
  }

  function handleSubmitRoster(e) {
    e.preventDefault();
    if (!email || !form.teamId || !form.tournamentId || !form.toEmail) return;

    submitRoster({
      teamId: form.teamId,
      tournamentId: form.tournamentId,
      coachEmail: email,
      toEmail: form.toEmail,
      note: form.note,
    });

    setForm((f) => ({ ...f, note: "", sent: true }));
    setTimeout(() => setForm((f) => ({ ...f, sent: false })), 1200);
    refreshCoachData();
  }

  const myPending = useMemo(
    () => apps.filter((a) => a.status === "pending"),
    [apps]
  );
  const myApproved = useMemo(
    () => apps.filter((a) => a.status === "approved"),
    [apps]
  );
  const myRejected = useMemo(
    () => apps.filter((a) => a.status === "rejected"),
    [apps]
  );

  if (!email) return null;

  return (
    <DashboardPage title="Coach Dashboard">
      {/* Quick application entry point */}
      <Section title="Apply to a Tournament">
        <ApplyForm />
      </Section>

      {/* Teams & Rosters CRUD */}
      <Section title="Manage Teams & Rosters">
        <TeamManager />
      </Section>

      {/* My Applications */}
      <Section title="My Applications">
        <div className="coach__apps">
          <h3 className="coach__h3">Pending</h3>
          {myPending.length === 0 ? (
            <p className="coach__muted">None.</p>
          ) : (
            <ul className="coach__applist">
              {myPending.map((a) => {
                const t = tournaments.find((tt) => tt.id === a.tournamentId);
                const team = getTeamById(a.teamId);
                return (
                  <li key={a.id} className="coach__app">
                    <div className="coach__appmeta">
                      <strong>{team?.name || "Team"}</strong> —{" "}
                      {team?.ageGroup || ""}
                      {a.tier ? ` • ${a.tier}` : ""}
                      {a.poolPref ? ` • Pool pref: ${a.poolPref}` : ""}
                      <div className="coach__appsub">Tournament: {t?.name}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <h3 className="coach__h3">Approved</h3>
          {myApproved.length === 0 ? (
            <p className="coach__muted">None.</p>
          ) : (
            <ul className="coach__applist">
              {myApproved.map((a) => {
                const t = tournaments.find((tt) => tt.id === a.tournamentId);
                const team = getTeamById(a.teamId);
                return (
                  <li key={a.id} className="coach__app">
                    <div className="coach__appmeta">
                      <strong>{team?.name || "Team"}</strong> —{" "}
                      {team?.ageGroup || ""}
                      {a.assigned?.tier ? ` • ${a.assigned.tier}` : ""}
                      {a.assigned?.pool ? ` • Pool ${a.assigned.pool}` : ""}
                      <div className="coach__appsub">Tournament: {t?.name}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <h3 className="coach__h3">Rejected</h3>
          {myRejected.length === 0 ? (
            <p className="coach__muted">None.</p>
          ) : (
            <ul className="coach__applist">
              {myRejected.map((a) => {
                const t = tournaments.find((tt) => tt.id === a.tournamentId);
                const team = getTeamById(a.teamId);
                return (
                  <li key={a.id} className="coach__app">
                    <div className="coach__appmeta">
                      <strong>{team?.name || "Team"}</strong> —{" "}
                      {team?.ageGroup || ""}
                      {a.tier ? ` • ${a.tier}` : ""}
                      {a.reason ? ` • Reason: ${a.reason}` : ""}
                      <div className="coach__appsub">Tournament: {t?.name}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </Section>

      {/* Send Roster to Director */}
      <Section id="send-roster" title="Send Roster to Director">
        {teams.length === 0 ? (
          <p className="coach__muted">
            Create a team above before submitting a roster.
          </p>
        ) : (
          <form className="coach__send" onSubmit={handleSubmitRoster}>
            <label className="field">
              <span className="field__label">Team</span>
              <select
                className="field__input"
                value={form.teamId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, teamId: e.target.value }))
                }
                required
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} — {t.ageGroup}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span className="field__label">Tournament</span>
              <select
                className="field__input"
                value={form.tournamentId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, tournamentId: e.target.value }))
                }
                required
              >
                {tournaments.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span className="field__label">Director email</span>
              <input
                className="field__input"
                type="email"
                value={form.toEmail}
                onChange={(e) =>
                  setForm((f) => ({ ...f, toEmail: e.target.value }))
                }
                placeholder="director@example.com"
                required
              />
            </label>

            <label className="field">
              <span className="field__label">Note (optional)</span>
              <input
                className="field__input"
                value={form.note}
                onChange={(e) =>
                  setForm((f) => ({ ...f, note: e.target.value }))
                }
                placeholder="Any context for the director"
              />
            </label>

            <button className="button" type="submit" disabled={form.sent}>
              Send Roster
            </button>
            {form.sent && (
              <p className="coach__sent" aria-live="polite">
                Roster sent to director!
              </p>
            )}
          </form>
        )}

        {/* Roster submission history */}
        <h3 className="coach__h3">My Roster Submissions</h3>
        {rosters.length === 0 ? (
          <p className="coach__muted">No submissions yet.</p>
        ) : (
          <ul className="coach__rosters">
            {rosters.map((r) => {
              const tMeta = tournaments.find((tt) => tt.id === r.tournamentId);
              const team = getTeamById(r.teamId);
              return (
                <li key={r.id} className="coach__roster">
                  <div className="coach__rmeta">
                    <strong>{team?.name || "Team"}</strong> —{" "}
                    {team?.ageGroup || ""} •{""}
                    {tMeta?.name || r.tournamentId} • Sent to {r.toEmail}
                  </div>
                  {r.note && <div className="coach__rnote">“{r.note}”</div>}
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      {/* Player Card Inbox (forward to director) */}
      <Section title="Player Card Inbox">
        {inbox.length === 0 ? (
          <p className="coach__muted">No player cards yet.</p>
        ) : (
          <ul className="coach__list">
            {inbox.map((i) => (
              <li key={i.id} className="coach__item">
                <div className="coach__row">
                  <div>
                    <div className="coach__from">From: {i.fromEmail}</div>
                    <div className="coach__doc">{i.doc?.name}</div>
                  </div>
                  <div className="coach__actions">
                    <label className="coach__label">
                      Director:
                      <select
                        className="coach__select"
                        value={toDirector}
                        onChange={(e) => setToDirector(e.target.value)}
                      >
                        {directors.map((d) => (
                          <option key={d.email} value={d.email}>
                            {d.name} ({d.email})
                          </option>
                        ))}
                      </select>
                    </label>
                    <button
                      className="button"
                      type="button"
                      onClick={() => forwardDocument(i.documentId)}
                    >
                      Forward
                    </button>
                  </div>
                </div>

                {i.doc?.mime === "image/jpeg" && (
                  <img
                    className="coach__preview"
                    src={i.doc.dataUrl}
                    alt="Player card"
                    loading="lazy"
                  />
                )}
                {i.doc?.mime === "application/pdf" && (
                  <object
                    className="coach__preview"
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
    </DashboardPage>
  );
}
