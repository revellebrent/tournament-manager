import { useEffect, useMemo, useState } from "react";

import { getTeamById, listDivisionsByTournament } from "../../utils/db";
import ChipToggle from "../common/ChipToggle.jsx";
import "./PublicSchedule.css";

const NOW_WINDOW_MIN = 120; // 120 minutes
const NOW_GRACE_PAST_MIN = 15; // shows game that start (15 min)
const pad = (n) => String(n).padStart(2, "0");
const getLocalDateKey = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export default function PublicSchedule({ tournamentId }) {
  const [divisions, setDivisions] = useState([]);
  const [query, setQuery] = useState("");
  const [fieldFilter, setFieldFilter] = useState("");
  const [dayFilter, setDayFilter] = useState("");
  const [quick, setQuick] = useState("all");

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
      if (x.divisionName !== y.divisionName)
        return x.divisionName.localeCompare(y.divisionName);
      return `${x.aName} vs ${x.bName}`.localeCompare(
        `${y.aName} vs ${y.bName}`
      );
    });
    return out;
  }, [divisions]);

  const fields = useMemo(() => {
    const s = new Set(rows.map((r) => r.field).filter(Boolean));
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const days = useMemo(() => {
    const s = new Set(
      rows
        .map((r) => r.kickoffAt)
        .filter(Boolean)
        .map((iso) => getLocalDateKey(new Date(iso)))
    );
    return Array.from(s).sort();
  }, [rows]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const nowMs = Date.now();
    const startNow = nowMs - NOW_GRACE_PAST_MIN * 60 * 1000;
    const endNow = nowMs + NOW_WINDOW_MIN * 60 * 1000;
    const todayStr = getLocalDateKey(new Date(nowMs));

    return rows.filter((r) => {
      if (needle) {
        const hay = `${r.divisionName} ${r.aName} ${r.bName}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      if (fieldFilter && r.field !== fieldFilter) return false;
      // Quick filters take priority
      if (quick === "now") {
        if (!r.kickoffAt) return false;
        const t = Date.parse(r.kickoffAt);
        if (!Number.isFinite(t)) return false;
        if (t < startNow || t > endNow) return false;
      } else if (quick === "today") {
        const day = r.kickoffAt ? getLocalDateKey(new Date(r.kickoffAt)) : "";
        if (day !== todayStr) return false;
      } else if (dayFilter) {
        const day = r.kickoffAt ? getLocalDateKey(new Date(r.kickoffAt)) : "";
        if (day !== dayFilter) return false;
      }
      return true;
    });
  }, [rows, query, fieldFilter, dayFilter, quick]);

  const formatLocalDateTime = (iso) => {
    if (!iso) return "TBD";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "TBD";
    return d.toLocaleString(undefined, {
      weekday: "short",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (rows.length === 0) {
    return <p className="psched__muted">No published schedule yet.</p>;
  }

  return (
    <section className="psched section">
      <h2 className="section__h2">Schedule</h2>

      <div className="section__toolbar">
        <input
          aria-label="Search division or team"
          className="field__input psched__search"
          placeholder="Search division or team..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          aria-label="Filter by field"
          className="field__input"
          value={fieldFilter}
          onChange={(e) => setFieldFilter(e.target.value)}
        >
          <option value="">All fields</option>
          {fields.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter by day"
          className="field__input"
          value={dayFilter}
          onChange={(e) => {
            setDayFilter(e.target.value);
            setQuick("all");
          }}
        >
          <option value="">All days</option>
          {days.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <span className="section__spacer" />
        <ChipToggle
          ariaLabel="Quick schedule filters"
          options={[
            {
              value: "now",
              label: "Now",
              title: "Matches happening now or starting soon",
            },
            { value: "today", label: "Today", title: "Today's matches" },
          ]}
          value={quick}
          onChange={(v) => {
            setQuick(v);
            setDayFilter("");
          }}
        />
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
                    {(Number.isFinite(r.aScore) ||
                      Number.isFinite(r.bScore)) && (
                      <span className="psched__score">
                        &nbsp;&nbsp;
                        {Number.isFinite(r.aScore) ? r.aScore : "—"} :{" "}
                        {Number.isFinite(r.bScore) ? r.bScore : "—"}
                      </span>
                    )}
                  </td>
                  <td className="psched__td">{r.field || "TBD"}</td>
                  <td className="psched__td">
                    {formatLocalDateTime(r.kickoffAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
