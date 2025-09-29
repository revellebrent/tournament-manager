import { useEffect, useMemo, useState } from "react";
import "./BracketReadOnly.css";
import {
  listDivisionsByTournament,
  getTeamById,
  computeStandings,
} from "../../utils/db";

export default function BracketReadOnly({ tournamentId }) {
  const [divisions, setDivisions] = useState([]);

  useEffect(() => {
    if (!tournamentId) return;
    setDivisions(listDivisionsByTournament(tournamentId));
  }, [tournamentId]);

  const published = useMemo(
    () => (divisions || []).filter((d) => d.published),
    [divisions]
  );

  if (!published.length) {
    return <p className="brro__muted">Brackets not published yet.</p>;
  }

  return (
    <div className="brro">
      {published.map((d) => {
        const standings = computeStandings(d);

        return (
          <section key={d.id} className="brro__card">
            <h3 className="brro__title">{d.name}</h3>

            <div className="brro__sub">Teams</div>
            {!d.teamIds || d.teamIds.length === 0 ? (
              <p className="brro__muted">No teams yet.</p>
            ) : (
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
            )}

            {d.matches?.length > 0 && (
              <>
                <div className="brro__sub">Matches</div>
                <ul className="brro__matches">
                  {d.matches.map((m) => {
                    const a = getTeamById(m.aTeamId);
                    const b = getTeamById(m.bTeamId);
                    const aScore = Number.isFinite(m.aScore)
                      ? String(m.aScore)
                      : "—";
                    const bScore = Number.isFinite(m.bScore)
                      ? String(m.bScore)
                      : "—";

                    return (
                      <li key={m.id} className="brro__match">
                        <span className="brro__matchlabel">
                          {a?.name || "Team A"} vs {b?.name || "Team B"}
                        </span>
                        <span className="brro__matchscore">
                          {aScore} : {bScore}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}

            {d.matches?.length > 0 && (
              <>
                <div className="brro__sub">Standings</div>
                {standings.length ? (
                  <div className="brro__tablewrap">
                    <table className="brro__table">
                      <thead>
                        <tr>
                          <th className="brro__th brro__th--team">Team</th>
                          <th className="brro__th">GP</th>
                          <th className="brro__th">W</th>
                          <th className="brro__th">D</th>
                          <th className="brro__th">L</th>
                          <th className="brro__th">GF</th>
                          <th className="brro__th">GA</th>
                          <th className="brro__th">GD</th>
                          <th className="brro__th">Pts</th>
                        </tr>
                      </thead>
                      <tbody>
                        {standings.map((row) => {
                          const t = getTeamById(row.teamId);
                          return (
                            <tr key={row.teamId}>
                              <td className="brro__td brro__td--team">
                                {t?.name || "Team"}
                              </td>
                              <td className="brro__td">{row.gp}</td>
                              <td className="brro__td">{row.w}</td>
                              <td className="brro__td">{row.d}</td>
                              <td className="brro__td">{row.l}</td>
                              <td className="brro__td">{row.gf}</td>
                              <td className="brro__td">{row.ga}</td>
                              <td className="brro__td">{row.gd}</td>
                              <td className="brro__td">{row.pts}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="brro__muted">
                    Standings will appear after scores are entered.
                  </p>
                )}
              </>
            )}
          </section>
        );
      })}
    </div>
  );
}
