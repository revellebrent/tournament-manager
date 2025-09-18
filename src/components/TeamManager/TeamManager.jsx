import { useEffect, useMemo, useState } from "react";
import "./TeamManager.css";
import { useAuth } from "../../context/AuthContext";
import {
  listSharesTo,
  getDocumentById,
  createTeam,
  listTeamsByCoach,
  addPlayerToTeam,
  removePlayerFromTeam,
  setPlayerCard,
} from "../../utils/db";

export default function TeamManager() {
  const { user } = useAuth();
  const coachEmail = user?.email;

  const [teams, setTeams] = useState([]);
  const [activeId, setActiveId] = useState("");
  const [newTeam, setNewTeam] = useState({ name: "", ageGroup: "" });
  const [inboxDocs, setInboxDocs] = useState([]);

  useEffect(() => {
    if (!coachEmail) return;
    setTeams(listTeamsByCoach(coachEmail));
    const shares = listSharesTo(coachEmail);
    const docs = shares
      .map((s) => getDocumentById(s.documentId))
      .filter(Boolean)
      .filter(d => d.mime === "image/jpeg" || d.mime === "application/pdf");
    setInboxDocs(docs);
  }, [coachEmail]);

  useEffect(() => {
    if (!activeId && teams.length) setActiveId(teams[0].id);
  }, [teams, activeId]);

  function refresh() {
    setTeams(listTeamsByCoach(coachEmail));
  }

  function handleCreateTeam(e) {
    e.preventDefault();
    if (!newTeam.name) return;
    const t = createTeam({ coachEmail, name: newTeam.name, ageGroup: newTeam.ageGroup });
    setNewTeam({ name: "", ageGroup: "" });
    setActiveId(t.id);
    refresh();
  }

  const activeTeam = useMemo(
    () => teams.find((t) => t.id === activeId) || teams[0] || null,
    [teams, activeId]
  );

  function handleAddPlayer(e) {
    e.preventDefault();
    if (!activeTeam) return;
    const fd = new FormData(e.target);
    const name = fd.get("name") || "";
    const jersey = fd.get("jersey") || "";
    const dob = fd.get("dob") || "";
    const cardDocId = fd.get("cardDocId") || "";
    if (!name) return;
    addPlayerToTeam(activeTeam.id, { name, jersey, dob, cardDocId: cardDocId || null });
    e.target.reset();
    refresh();
  }

  return (
    <section className="team section">
      <h2 className="team__h2">My Teams & Rosters</h2>

      <form className="team__create" onSubmit={handleCreateTeam}>
        <label className="field">
          <span className="field__label">Team Name</span>
          <input className="field__input" name="name" value={newTeam.name} onChange={e=>setNewTeam(v=>({...v, name:e.target.value}))} placeholder="Memphis United 2013B" required />
        </label>
        <label className="field">
          <span className="field__label">Age Group</span>
          <input className="field__input" name="ageGroup" value={newTeam.ageGroup} onChange={e=>setNewTeam(v=>({...v, ageGroup:e.target.value}))} placeholder="U12 Boys" />
        </label>
        <button className="button" type="submit">Create Team</button>
      </form>

        {teams.length === 0 ? (
          <p className="team__muted">No teams yet. Create your first team above.</p>
        ) : (
          <>
          <div className="team__switcher">
            <label className="field">
              <span className="field__label">Select Team</span>
              <select className="field__input" value={activeTeam?.id || ""} onChange={(e)=>setActiveId(e.target.value)}>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>{t.name} — {t.ageGroup}
                  </option>
                  ))}
                </select>
            </label>
          </div>

          <div className="team__grid">
            <div className="team__col">
              <h3 className="team__h3">Rosters</h3>
              {activeTeam?.players?.length ? (
                <ul className="team__players">
                  {activeTeam.players.map(p=> (
                    <li key={p.id} className="team__player">
                      <div className="team__pmeta">
                        <strong>{p.name}</strong> {p.jersey ? `#${p.jersey}` : ""} {p.dob ? `• ${p.dob}` : ""}
                        {p.cardDocId ? <span className="team__tag">card attached</span> : <span className="team__tag team__tag--warn">no card</span>}
                      </div>
                      <div className="team__pactions">
                        {!p.cardDocId && (
                          <AttachCard inboxDocs={inboxDocs} onAttach={(docId)=>{ setPlayerCard(activeTeam.id, p.id, docId); refresh() }} />
                        )}
                        <button className="button" type="button" onClick={() => { removePlayerFromTeam(activeTeam.id, p.id); refresh(); }}>Remove</button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="team__muted">No players yet.</p>
              )}
            </div>

            <div className="team__col">
              <h3 className="team__h3">Add Player</h3>
              <form className="team__addplayer" onSubmit={handleAddPlayer}>
                <label className="field">
                  <span className="field__label">Player Name</span>
                  <input className="field__input" name="name" placeholder="John Doe" required />
                </label>
                <label className="field">
                  <span className="field__label">Jersey #</span>
                  <input className="field__input" name="jersey" placeholder="XX" />
                </label>
                <label className="field">
                  <span className="field__label">Date of Birth</span>
                  <input className="field__input" name="dob" type="date" />
                </label>
                <label className="field">
                  <span className="field__label">Attach player card</span>
                  <select className="field__input" name="cardDocId" defaultValue="">
                    <option value="">— choose from inbox —</option>
                    {inboxDocs.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                        </option>
                    ))}
                  </select>
                </label>
                <button className="button" type="submit">Add Player</button>
              </form>
            </div>
          </div>
          </>
          )}
    </section>
  );
}

function AttachCard({ inboxDocs, onAttach }) {
  if (!inboxDocs.length) return <span className="team__muted">No cards in inbox</span>;
  return (
    <label className="field team__attach">
      <span className="visually-hidden">Attach card</span>
      <select className="field__input" onChange={(e)=>{ if(e.target.value) onAttach(e.target.value); }}>
        <option value="">Attach card...</option>
        {inboxDocs.map(d=> <option key={d.id} value={d.id}>{d.name}</option>)}
      </select>
    </label>
  );
}