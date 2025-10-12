import { useEffect, useMemo, useState } from "react";
import "./PublicStandings.css";
import {
  listDivisionsByTournament,
  getTeamById,
  computeStandings,
} from "../../utils/db";

export default function PublicStandings({ tournamentId }) {
  const [divisions, setDivisions] = useState([]);

  useEffect(() => {
    if (!tournamentId) return;
    setDivisions(listDivisionsByTournament(tournamentId));
  }, [tournamentId]);

  const publishedDivs = useMemo(
    () => (divisions || []).filter((d) => !!d.published),
    [divisions]
  );

  if (publishedDivs.length === 0) {
    return <p className="pstand__muted">No published standings yet.</p>;
  }

  return (
    <section className="pstand">
      <h2 className="pstand__title">Standings</h2>

      <div className="pstand__wrap">
        {publishedDivs.map((d) => {
          const table = computeStandings(d);
          return (
            <div key={d.id} className="pstand__card">
              <h3 className="pstand__h3">{d.name}</h3>
              <div className="pstand__tablewrap">
                <table
                  className="pstand__table"
                  aria-label={`Standings for ${d.name}`}
                >
                  <thead>
                    <tr>
                      <th classname="pstand__th pstand__th--team">Teams</th>
                      <th className="pstand__th">GP</th>
                      <th className="pstand__th">W</th>
                      <th className="pstand__th">D</th>
                      <th className="pstand__th">L</th>
                      <th className="pstand__th">GF</th>
                      <th className="pstand__th">GA</th>
                      <th className="pstand__th">GD</th>
                      <th className="pstand__th">Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {table.map((row) => {
                      const team = getTeamById(row.teamId);
                      return (
                        <tr key={row.teamId}>
                          <td className="pstand__td pstand__td--team">
                            {team?.name || "Team"}
                          </td>
                          <td className="pstand__td">{row.gp}</td>
                          <td className="pstand__td">{row.w}</td>
                          <td className="pstand__td">{row.d}</td>
                          <td className="pstand__td">{row.l}</td>
                          <td className="pstand__td">{row.gf}</td>
                          <td className="pstand__td">{row.ga}</td>
                          <td className="pstand__td">{row.gd}</td>
                          <td className="pstand__td pstand__td--pts">
                            {row.pts}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
