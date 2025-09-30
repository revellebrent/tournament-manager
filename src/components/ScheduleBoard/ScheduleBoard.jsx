import { useEffect, useMemo, useState } from "react";
import "./ScheduleBoard.css";
import {
  listDivisionsByTournament,
  getTeamById,
  setMatchDetails,
} from "../../utils/db";
import { useAuth } from "../../context/AuthContext";

export default function ScheduleBoard({ tournamentId }) {
  const { role } = useAuth();
  const isDirector = role === "director";

  const [divisions, setDivisions] = useState([]);
  const [q, setQ] = useState("");
  const [fieldFilter, setFieldFilter] = useState("");
  const [dayFilter, setDayFilter] = useState("");

  useEffect(() => {
    if (!tournamentId) return;
    setDivisions(listDivisionsByTournament(tournamentId));
  }, [tournamentId]);

  function refresh() {
    setDivisions(listDivisionsByTournament(tournamentId));
  }

  const rows = useMemo(() => {
    const out = [];
    for (const d of divisions) {
      for (const m of d.matches || []) {
        const a = getTeamById(m.aTeamId);
        const b = getTeamById(m.bTeamId);
        out.push({
          divisionId: d.id,
          divisionName: d.name,
          published: !!d.published,
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

    // sort by kickoffAt then division then team names
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
        .map((iso) => new Date(iso).toISOString().slice(0, 10)) // YYYY-MM-DD
    );
    return Array.from(s).sort();
  }, [rows]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (needle) {
        const hay = `${r.divisionName} ${r.aName} ${r.bName}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      if (fieldFilter && r.field !== fieldFilter) return false;
      if (dayFilter) {
        const day = r.kickoffAt
          ? new Date(r.kickoffAt).toISOString().slice(0, 10)
          : "";
        if (day !== dayFilter) return false;
      }
      return true;
    });
  }, [rows, q, fieldFilter, dayFilter]);

  const fmtLocal = (iso) => {
    if (!iso) return "TBD";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "TBD";
    return d.toLocaleString(undefined, {
      weekday: "short",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const toLocalInput = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
      d.getDate()
    )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const exportCsv = () => {
    const header = [
      "Division",
      "Team A",
      "Team B",
      "A Score",
      "B Score",
      "Field",
      "Kickoff (local)",
      "Kickoff (ISO)",
    ];
    const lines = [header.join(",")];
    for (const r of filtered) {
      const row = [
        r.divisionName,
        r.aName,
        r.bName,
        Number.isFinite(r.aScore) ? r.aScore : "",
        Number.isFinite(r.bScore) ? r.bScore : "",
        r.field,
        fmtLocal(r.kickoffAt),
        r.kickoffAt || "",
      ].map((cell) => {
        const s = String(cell ?? "");
        return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
      });
      lines.push(row.join(","));
    }
    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tournament_schedule.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isDirector) return null;

  return (
    <section className="sched section">
      <h2 className="sched__title">Schedule Board</h2>

      <div className="sched__toolbar">
        <input
          className="field__input sched__search"
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
          {fields.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
        <select
          className="field__input"
          value={dayFilter}
          onChange={(e) => setDayFilter(e.target.value)}
        >
          <option value="">All days</option>
          {days.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <div className="sched__spacer" />
        <button className="button" type="button" onClick={exportCsv}>
          Download CSV
        </button>
        <button className="button" type="button" onClick={refresh}>
          Refresh
        </button>
      </div>

      {filtered.length === 0 ? (
        <p className="sched__muted">No matches to show.</p>
      ) : (
        <div className="sched__tablewrap">
          <table className="sched__table">
            <thead>
              <tr>
                <th className="sched__th">Division</th>
                <th className="sched__th sched__th--teams">Match</th>
                <th className="sched__th">Field</th>
                <th className="sched__th">Kickoff</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={`${r.divisionId}_${r.matchId}`}>
                  <td className="sched__td">
                    {r.divisionName}
                    {r.published ? "" : " (unpublished)"}
                  </td>
                  <td className="sched__td sched__td--teams">
                    <strong>{r.aName}</strong> vs <strong>{r.bName}</strong>
                    {Number.isFinite(r.aScore) || Number.isFinite(r.bScore) ? (
                      <span className="sched__score">
                        &nbsp;&nbsp;{Number.isFinite(r.aScore) ? r.aScore : "—"}{" "}
                        : {Number.isFinite(r.bScore) ? r.bScore : "—"}
                      </span>
                    ) : null}
                  </td>
                  <td className="sched__td">
                    <input
                      className="field__input"
                      value={r.field}
                      onChange={(e) => {
                        setMatchDetails(r.divisionId, r.matchId, {
                          field: e.target.value,
                          kickoffAt:
                            rows.find((x) => x.matchId === r.matchId)
                              ?.kickoffAt ?? null,
                        });
                        refresh();
                      }}
                      placeholder="e.g. Field 2"
                    />
                  </td>
                  <td className="sched__td">
                    <input
                      className="field__input"
                      type="datetime-local"
                      value={r.kickoffAt ? toLocalInput(r.kickoffAt) : ""}
                      onChange={(e) => {
                        const iso = e.target.value
                          ? new Date(e.target.value).toISOString()
                          : null;
                        setMatchDetails(r.divisionId, r.matchId, {
                          field:
                            rows.find((x) => x.matchId === r.matchId)?.field ||
                            "",
                          kickoffAt: iso,
                        });
                        refresh();
                      }}
                    />
                    <div className="sched__hint">{fmtLocal(r.kickoffAt)}</div>
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
