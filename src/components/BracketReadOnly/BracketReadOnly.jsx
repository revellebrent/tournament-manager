import { useEffect, useState } from "react";
import "./BracketReadOnly.css";
import { listDivisionsByTournament, getTeamById } from "../../utils/db";

export default function BracketReadOnly({ tournamentId }) {
  const [divisions, setDivisions] = useState([]);

  useEffect(() => {
    if (!tournamentId) return;
    setDivisions(listDivisionsByTournament(tournamentId));
  }, [tournamentId]);

  if (!divisions.length) {
    return <p className="brro__muted">Brackets not published yet.</p>;
  }

  return (
    <div className="brro">
      {divisions.map((d) => (
        <section key={d.id} className="brro__card">
          <h3 className="brro__title">{d.name}</h3>

          <div className="brro__sub">Teams</div>
          {d.teamIds?.length ? (
            <ul className="brro__teams">
              {d.teamIds.map((tid) => {
                const t = getTeamById(tid);
                return (
                  <li key={tid} className="brro__team">
                    {t?.name || "Team"} — {t?.ageGroup || ""}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="brro__muted">No teams yet.</p>
          )}

          {d.matches?.length > 0 && (
            <>
              <div className="brro__sub">Matches</div>
              <ul className="brro__matches">
                {d.matches.map((m) => {
                  const a = getTeamById(m.aTeamId);
                  const b = getTeamById(m.bTeamId);
                  return (
                    <li key={m.id} className="brro__match">
                      {a?.name || "Team A"} vs {b?.name || "Team B"}
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </section>
      ))}
    </div>
  );
}
