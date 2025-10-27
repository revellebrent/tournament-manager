import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { listDivisionsByTournament } from "../../utils/db";
import { tournaments } from "../../utils/tournaments";
import "./SpectatorDashboard.css";

export default function SpectatorDashboard() {
  const [tid, setTid] = useState(tournaments[0]?.id || "");
  const [divs, setDivs] = useState([]);

  useEffect(() => {
    if (tid) setDivs(listDivisionsByTournament(tid));
  }, [tid]);

  const published = useMemo(() => divs.filter((d) => d.published), [divs]);

  if (!tournaments.length) {
    return (
      <main className="spectator container section">
        <h1 className="spectator__title">Spectator</h1>
        <p className="spectator__empty" aria-live="polite">
          No tournaments available yet.
        </p>
      </main>
    );
  }

  return (
    <main className="spectator container section">
      <h1 className="spectator__title">Spectator</h1>

      <div className="spectator__controls">
        <label className="spectator__control">
          <span className="spectator__controllabel">Tournament</span>
          <select
            className="spectator__controlinput"
            value={tid}
            onChange={(e) => setTid(e.target.value)}
            aria-label="Select tournament"
          >
            {tournaments.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>

        <div className="spectator__status" aria-live="polite">
          <span className="spectator__pill">
            {published.length} published division
            {published.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="spectator__actions">
          <Link className="spectator__btn" to={`/public/${tid}/schedule`}>
            View Schedule
          </Link>
          <Link className="spectator__btn" to={`/public/${tid}/standings`}>
            View Standings
          </Link>
        </div>
      </div>

      {published.length === 0 ? (
        <p className="spectator__empty" aria-live="polite">
          Nothing has been published for this tournament yet.
        </p>
      ) : (
        <section className="spectator__panel">
          <h2 className="spectator__paneltitle">Published Divisions</h2>
          <ul className="spectator__list">
            {published.map((d) => (
              <li key={d.id} className="spectator__item">
                <div className="spectator__itemmain">
                  <strong className="spectator__itemname">{d.name}</strong>
                  <span className="spectator__itemmeta">
                    {d.tier ? `Tier: ${d.tier}` : null}
                    {d.pool ? (d.tier ? " • " : "") + `Pool ${d.pool}` : null}
                  </span>
                </div>
                <div className="spectator__itemactions">
                  <Link
                    className="spectator__link"
                    to={`/public/${tid}/schedule`}
                  >
                    Schedule
                  </Link>
                  <Link
                    className="spectator__link"
                    to={`/public/${tid}/standings`}
                  >
                    Standings
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
