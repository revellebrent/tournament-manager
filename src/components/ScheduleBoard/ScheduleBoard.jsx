import { useEffect, useMemo, useState, useRef } from "react";
import "./ScheduleBoard.css";
import {
  listDivisionsByTournament,
  getTeamById,
  setMatchDetails,
  setMatchScore,
} from "../../utils/db";
import { useAuth } from "../../context/AuthContext";

export default function ScheduleBoard({ tournamentId }) {
  const { role } = useAuth();
  const isDirector = role === "director";

  const [divisions, setDivisions] = useState([]);
  const [q, setQ] = useState("");
  const [fieldFilter, setFieldFilter] = useState("");
  const [dayFilter, setDayFilter] = useState("");
  const [quick, setQuick] = useState("all");
  const NOW_WINDOW_MIN = 120;
  const NOW_GRACE_PAST_MIN = 15;
  const pad = (n) => String(n).padStart(2, "0");
  const localDateKey = (d) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

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

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const nowMs = Date.now();
    const startNow = nowMs - NOW_GRACE_PAST_MIN * 60 * 1000;
    const endNow = nowMs + NOW_WINDOW_MIN * 60 * 1000;
    const todayStr = localDateKey(new Date(nowMs));

    return rows.filter((r) => {
      if (needle) {
        const hay = `${r.divisionName} ${r.aName} ${r.bName}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      if (fieldFilter && r.field !== fieldFilter) return false;
      if (quick === "now") {
        if (!r.kickoffAt) return false;
        const t = Date.parse(r.kickoffAt);
        if (!Number.isFinite(t)) return false;
        if (t < startNow || t > endNow) return false;
      } else if (quick === "today") {
        const day = r.kickoffAt ? localDateKey(new Date(r.kickoffAt)) : "";
        if (day !== todayStr) return false;
      } else if (dayFilter) {
        const day = r.kickoffAt ? localDateKey(new Date(r.kickoffAt)) : "";
        if (day !== dayFilter) return false;
      }
      return true;
    });
  }, [rows, q, fieldFilter, dayFilter, quick]);

  const days = useMemo(() => {
    const s = new Set(
      rows
        .map((r) => r.kickoffAt)
        .filter(Boolean)
        .map((iso) => localDateKey(new Date(iso)))
    );
    return Array.from(s).sort();
  }, [rows]);

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

  function ScoreInputs({ row, onSaved }) {
    const aRef = useRef(null);
    const bRef = useRef(null);

    const toIntOrNull = (v) => {
      const n = Number.parseInt(v, 10);
      return Number.isFinite(n) ? n : null;
    };

    const save = () => {
      const a = toIntOrNull(aRef.current?.value ?? "");
      const b = toIntOrNull(bRef.current?.value ?? "");
      setMatchScore(row.divisionId, row.matchId, a, b);
      onSaved?.();
    };

    const onKey = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        save();
      }
    };

    return (
      <span className="sched__scorebox">
        <input
          ref={aRef}
          className="sched__scoreinput"
          type="number"
          min="0"
          step="1"
          inputMode="numeric"
          placeholder="—"
          defaultValue={Number.isFinite(row.aScore) ? row.aScore : ""}
          aria-label={`Score for ${row.aName}`}
          onBlur={save}
          onKeyDown={onKey}
          onWheel={(e) => e.currentTarget.blur()}
        />
        <span>:</span>
        <input
          ref={bRef}
          className="sched__scoreinput"
          type="number"
          min="0"
          step="1"
          inputMode="numeric"
          placeholder="—"
          defaultValue={Number.isFinite(row.bScore) ? row.bScore : ""}
          aria-label={`Score for ${row.bName}`}
          onBlur={save}
          onKeyDown={onKey}
          onWheel={(e) => e.currentTarget.blur()}
        />
      </span>
    );
  }

  if (!isDirector) return null;

  return (
    <section className="sched section">
      <h2 className="sched__title">Schedule Board</h2>

      <div className="sched__toolbar">
        <input
          aria-label="Search division or team"
          className="field__input sched__search"
          placeholder="Search division or team..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
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

        {/* Quick chips */}
        <div className="sched__quick">
          <button
            type="button"
            className={`chip ${quick === "now" ? "chip--on" : ""}`}
            aria-pressed={quick === "now"}
            onClick={() => {
              setQuick((prev) => (prev === "now" ? "all" : "now"));
              setDayFilter("");
            }}
            title="Matches happening now or starting soon"
          >
            Now
          </button>
          <button
            type="button"
            className={`chip ${quick === "today" ? "chip--on" : ""}`}
            aria-pressed={quick === "today"}
            onClick={() => {
              setQuick((prev) => (prev === "today" ? "all" : "today"));
              setDayFilter("");
            }}
            title="Today's matches"
          >
            Today
          </button>
        </div>

        <div className="sched__spacer" />
        <button
          className="button"
          type="button"
          onClick={exportCsv}
          disabled={filtered.length === 0}
        >
          Download CSV
        </button>
        <button className="button" type="button" onClick={refresh}>
          Refresh
        </button>

        <button
          className="button"
          type="button"
          onClick={() => {
            const url = `${window.location.origin}/public/${tournamentId}/schedule`;
            navigator.clipboard?.writeText(url);
            alert("Public schedule link copied to clipboard!");
          }}
        >
          Copy Public Link
        </button>
      </div>

      {filtered.length === 0 ? (
        <p className="sched__muted" aria-live="polite">
          No matches to show.
        </p>
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
                    <ScoreInputs row={r} onSaved={refresh} />
                    {(Number.isFinite(r.aScore) ||
                      Number.isFinite(r.bScore)) && (
                      <button
                        type="button"
                        className="sched__clear"
                        title="Clear score"
                        aria-label={`Clear score for ${r.aName} vs ${r.bName}`}
                        onClick={() => {
                          setMatchScore(r.divisionId, r.matchId, null, null);
                          refresh();
                        }}
                      >
                        Clear
                      </button>
                    )}
                  </td>
                  <td className="sched__td">
                    <input
                      className="field__input"
                      value={r.field}
                      onChange={(e) => {
                        setMatchDetails(r.divisionId, r.matchId, {
                          field: e.target.value,
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
