import { useEffect, useMemo, useState } from "react";
import "./PublicSchedule.css";
import { listDivisionsByTournament, getTeamById } from "../../utils/db";

export default function PublicSchedule({ tournamentId }) {
  const [divisions, setDivisions] = useState([]);
  const [q, setQ] = useState("");
  const [fieldFilter, setFieldFilter] = useState("");
  const [dayFilter, setDayFilter] = useState("");

  useEffect(() => {
    if (!tournamentId) return;
    setDivisions(listDivisionsByTournament(tournamentId));
  }, [tournamentId]);

  const rows = useMemo(() => {
    const out = [];
    for (const d of divisions) {
      if (!d.published) continue;
      for (const m of d.matches || []) {
        const a = getTeamById(m.aTeamId);
        const b = getTeamById(m.bTeamId);
        out.push({
          divisionId: d.id,
          divisionName: d.name,
          matchId: m.id,
          aName: a?.name || "Team A",
          bName: b?.name || "Team B",
          aScore: m.aScore,
          bScore: m.bScore,
          field: m.field || "",
          kickoffAt: m.kickoffAt || null,
        });
      }
    }
    // sort order - kickoffAt, division, match label
    out.sort((x, y) => {
      const tx = x.kickoffAt ? Date.parse(x.kickoffAt) : Infinity;
      const ty = y.kickoffAt ? Date.parse(y.kickoffAt) : Infinity;
      if (tx !== ty) return tx - ty;
      if (x.divisionName !== y.divisionName) return x.divisionName.localeCompare(y.divisionName);
      return `${x.aName} vs ${x.bName}`.localeCompare(`${y.aName} vs ${y.bName}`);
    });
    return out;
  }, [divisions]);

  const fields = useMemo(() => {
    const s = new Set(rows.map(r => r.field).filter(Boolean));
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const days = useMemo(() => {
    const s = new Set(
      rows
      .map(r => r.kickoffAt)
      .filter(Boolean)
      .map(iso => new Date(iso).toISOString().slice(0, 10)) // YYYY-MM-DD
    );
    return Array.from(s).sort();
  }, [rows]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter(r => {
      if (needle) {
        const hay = `${r.divisionName} ${r.aName} ${r.bName}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      if (fieldFilter && r.field !== fieldFilter) return false;
      if (dayFilter) {
        const day = r.kickoffAt ? new Date(r.kickoffAt).toISOString().slice(0, 10) : "";
        if (day !== dayFilter) return false;
      }
      return true;
    });
  }, [rows, q, fieldFilter, dayFilter]);

  const fmtLocal = (iso) => {
    if (!iso) return "TBD";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "TBD";
    return d.toLocaleString(undefined, { weekday: "short", hour: "numeric", minute: "2-digit" });
  };

  if (rows.length === 0) {
    return <p className="psched__muted">No published schedule yet.</p>
  }

  return (
    <section className="psched">
      <div className="psched__toolbar">
        <input
        className="field__input psched__search"
        placeholder="Search division or team..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
        />
        <select
        className="field__input"
        value={fieldFilter}
        onChange={(e) => setFieldFilter(e.target.value)}
        >
          <option value="">All fields</option>
          {fields.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
        <select
        className="field__input"
        value={dayFilter}
        onChange={(e) => setDayFilter(e.target.value)}
        >
          <option value="">All days</option>
          {days.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="psched__muted">No matches match your filters.</p>
      ) : (
        <div className="psched__tablewrap">
          <table className="psched__table">
            <thead>
              <tr>
                <th className="psched__th">Division</th>
                <th className="psched__th psched__th--teams">Match</th>
                <th className="psched__th">Field</th>
                <th className="psched__th">Kickoff</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={`${r.divisionId}_${r.matchId}`}>
                  <td className="psched__td">{r.divisionName}</td>
                  <td className="psched__td psched__td--teams">
                    <strong>{r.aName}</strong> vs <strong>{r.bName}</strong>
                    {(Number.isFinite(r.aScore) || Number.isFinite(r.bScore)) && (
                      <span className="psched__score">
                        &nbsp;&nbsp;
                        {Number.isFinite(r.aScore) ? r.aScore : "—"} : {Number.isFinite(r.bScore) ? r.bScore : "—"}
                      </span>
                    )}
                  </td>
                  <td className="psched__td">{r.field || "TBD"}</td>
                  <td className="psched__td">{fmtLocal(r.kickoffAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}