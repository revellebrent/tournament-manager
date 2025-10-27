import { useEffect, useMemo, useState } from "react";

import { useAuth } from "../../context/AuthContext.jsx";
import {
  addTeamToDivision,
  computeStandings,
  createDivision,
  generateRoundRobin,
  getTeamById,
  listApplicationsByTournament,
  listDivisionsByTournament,
  removeTeamFromDivision,
  setDivisionPublished,
  setMatchDetails,
  setMatchScore,
} from "../../utils/db";
import "./BracketBuilder.css";

const TIER_OPTIONS = ["Gold", "Silver", "Bronze", "Custom"];
const POOLS = ["A", "B", "C", "D", "E", "F", "G", "H"];

export default function BracketBuilder({ tournamentId }) {
  const { role } = useAuth();
  const isDirector = role === "director";

  const [apps, setApps] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [form, setForm] = useState({ tier: "Gold", pool: "A", customTier: "" });

  useEffect(() => {
    if (!tournamentId) return;
    setApps(listApplicationsByTournament(tournamentId));
    setDivisions(listDivisionsByTournament(tournamentId));
  }, [tournamentId]);

  function refresh() {
    setApps(listApplicationsByTournament(tournamentId));
    setDivisions(listDivisionsByTournament(tournamentId));
  }

  const approvedTeams = useMemo(() => {
    return apps
      .filter((a) => a.status === "approved")
      .map((a) => ({
        appId: a.id,
        team: getTeamById(a.teamId),
        tier: a.assigned?.tier || a.tier || "",
        pool: a.assigned?.pool || "",
      }))
      .filter((t) => t.team);
  }, [apps]);

  function handleCreateDivision(e) {
    e.preventDefault();
    const tierName =
      form.tier === "Custom" ? form.customTier || "Custom" : form.tier;
    createDivision({
      tournamentId,
      tier: tierName,
      pool: form.pool,
      name: `${tierName} • Pool ${form.pool}`,
    });
    setForm({ tier: "Gold", pool: "A", customTier: "" });
    refresh();
  }

  function handleAddTeam(dId, teamId) {
    addTeamToDivision(dId, teamId);
    refresh();
  }

  function handleRemoveTeam(dId, teamId) {
    removeTeamFromDivision(dId, teamId);
    refresh();
  }

  const parseScore = (v) => {
    if (v === "" || v === null || v === undefined) return null;
    const n = Number(v);
    if (!Number.isFinite(n)) return null;
    return n < 0 ? 0 : n;
  };

  const formatLocalDateTimeInput = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
      d.getDate()
    )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  if (!isDirector) return null;

  return (
    <div className="brkt">
      <h3 className="brkt__title">Bracket Builder</h3>

      <form className="brkt__create" onSubmit={handleCreateDivision}>
        <label className="field">
          <span className="field__label">Tier</span>
          <select
            className="field__input"
            value={form.tier}
            onChange={(e) => setForm((f) => ({ ...f, tier: e.target.value }))}
          >
            {TIER_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>

        {form.tier === "Custom" && (
          <label className="field">
            <span className="field__label">Custom Tier</span>
            <input
              className="field__input"
              value={form.customTier}
              onChange={(e) =>
                setForm((f) => ({ ...f, customTier: e.target.value }))
              }
              placeholder="e.g. Platinum"
              required
            />
          </label>
        )}

        <label className="field">
          <span className="field__label">Pool</span>
          <select
            className="field__input"
            value={form.pool}
            onChange={(e) => setForm((f) => ({ ...f, pool: e.target.value }))}
          >
            {POOLS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>

        <button
          className="button"
          type="submit"
          disabled={form.tier === "Custom" && !form.customTier.trim()}
          title={
            form.tier === "Custom" && !form.customTier.trim()
              ? "Enter a custom tier name"
              : "Create Division"
          }
        >
          Create Division
        </button>
      </form>

      <div className="brkt__grid">
        {/* Approved teams list */}
        <div className="brkt__col">
          <h4 className="brkt__h4">Approved Teams</h4>
          {approvedTeams.length === 0 ? (
            <p className="brkt__muted">No approved applications yet.</p>
          ) : (
            <ul className="brkt__list">
              {approvedTeams.map(({ appId, team, tier, pool }) => (
                <li key={appId} className="brkt__item">
                  <div>
                    <strong>{team.name}</strong> — {team.ageGroup}{" "}
                    {tier ? `• ${tier}` : ""} {pool ? `• Pool ${pool}` : ""}
                  </div>
                  <div className="brkt__actions">
                    {divisions.map((d) => (
                      <button
                        key={d.id}
                        className="button"
                        type="button"
                        aria-label={`Add ${team.name} to ${d.name}`}
                        onClick={() => handleAddTeam(d.id, team.id)}
                      >
                        Add to {d.name}
                      </button>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Divisions view */}
        <div className="brkt__col">
          <h4 className="brkt__h4">Divisions</h4>
          {divisions.length === 0 ? (
            <p className="brkt__muted">No divisions created yet.</p>
          ) : (
            <ul className="brkt__list">
              {divisions.map((d) => {
                const standings = computeStandings(d);
                const hasMatches = (d.matches?.length ?? 0) > 0;
                const checkCanGenerate = (d.teamIds?.length ?? 0) >= 2;
                const handleGenerate = () => {
                  if (
                    hasMatches &&
                    !window.confirm(
                      "This will overwrite existing matches for this division. Continue?"
                    )
                  )
                    return;
                  generateRoundRobin(d.id);
                  refresh();
                };

                return (
                  <li key={d.id} className="brkt__card">
                    <div className="brkt__cardhead">
                      <strong>{d.name}</strong>
                      <div className="brkt__headactions">
                        <button
                          className="button"
                          type="button"
                          onClick={handleGenerate}
                          disabled={!checkCanGenerate}
                          title={
                            !checkCanGenerate
                              ? "Add at least 2 teams to generate matches"
                              : hasMatches
                                ? "Regenerate matches (will overwrite)"
                                : "Generate matches"
                          }
                        >
                          {hasMatches ? "Regenerate" : "Generate Round-Robin"}
                        </button>

                        <button
                          className="button"
                          type="button"
                          onClick={() => {
                            setDivisionPublished(d.id, !d.published);
                            refresh();
                          }}
                          disabled={!d.teamIds?.length}
                          title={
                            !d.teamIds?.length
                              ? "Add at least one team before publishing"
                              : d.published
                                ? "Unpublish (hide from public view)"
                                : "Publish (show on public view)"
                          }
                        >
                          {d.published ? "Unpublish" : "Publish"}
                        </button>
                      </div>
                    </div>

                    {/* Teams */}
                    <div className="brkt__sub">Teams</div>
                    {!d.teamIds || d.teamIds.length === 0 ? (
                      <p className="brkt__muted">No teams assigned.</p>
                    ) : (
                      <ul className="brkt__teams">
                        {d.teamIds.map((tid) => {
                          const t = getTeamById(tid);
                          return (
                            <li key={tid} className="brkt__team">
                              <span>
                                {t?.name || "Team"} — {t?.ageGroup || ""}
                              </span>
                              <button
                                className="button"
                                type="button"
                                onClick={() => {
                                  if (
                                    !d.matches?.length ||
                                    window.confirm(
                                      "This division already has matches. Remove the team anyway?"
                                    )
                                  ) {
                                    handleRemoveTeam(d.id, tid);
                                  }
                                }}
                              >
                                Remove
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}

                    {/* Matches with score entry */}
                    {d.matches?.length > 0 && (
                      <>
                        <div className="brkt__sub">Matches (enter scores)</div>
                        <ul className="brkt__matches">
                          {d.matches.map((m) => {
                            const a = getTeamById(m.aTeamId);
                            const b = getTeamById(m.bTeamId);
                            return (
                              <li key={m.id} className="brkt__match">
                                <span className="brkt__matchlabel">
                                  {a?.name || "Team A"} vs {b?.name || "Team B"}
                                </span>

                                <div className="brkt__scores">
                                  <label className="brkt__score">
                                    <span className="visually-hidden">
                                      {a?.name || "Team A"} score
                                    </span>
                                    <input
                                      className="field__input"
                                      type="number"
                                      min="0"
                                      inputMode="numeric"
                                      onWheel={(e) => e.currentTarget.blur()}
                                      value={
                                        Number.isFinite(m.aScore)
                                          ? String(m.aScore)
                                          : ""
                                      }
                                      onChange={(e) => {
                                        const aVal = parseScore(e.target.value);
                                        setMatchScore(
                                          d.id,
                                          m.id,
                                          aVal,
                                          m.bScore ?? null
                                        );
                                        refresh();
                                      }}
                                    />
                                  </label>
                                  <span>:</span>
                                  <label className="brkt__score">
                                    <span className="visually-hidden">
                                      {b?.name || "Team B"} score
                                    </span>
                                    <input
                                      className="field__input"
                                      type="number"
                                      min="0"
                                      inputMode="numeric"
                                      onWheel={(e) => e.currentTarget.blur()}
                                      value={
                                        Number.isFinite(m.bScore)
                                          ? String(m.bScore)
                                          : ""
                                      }
                                      onChange={(e) => {
                                        const bVal = parseScore(e.target.value);
                                        setMatchScore(
                                          d.id,
                                          m.id,
                                          m.aScore ?? null,
                                          bVal
                                        );
                                        refresh();
                                      }}
                                    />
                                  </label>

                                  <button
                                    type="button"
                                    className="button brkt__clear"
                                    onClick={() => {
                                      setMatchScore(d.id, m.id, null, null);
                                      refresh();
                                    }}
                                    title="Clear both scores"
                                  >
                                    Clear
                                  </button>
                                </div>
                                <div className="brkt__sched">
                                  <label className="field">
                                    <span className="field__label">Field</span>
                                    <input
                                      className="field__input"
                                      value={m.field || ""}
                                      onChange={(e) => {
                                        setMatchDetails(d.id, m.id, {
                                          field: e.target.value,
                                          kickoffAt: m.kickoffAt ?? null,
                                        });
                                        refresh();
                                      }}
                                      placeholder="e.g. Field 4"
                                    />
                                  </label>

                                  <label className="field">
                                    <span className="field__label">
                                      Kickoff
                                    </span>
                                    <input
                                      className="field__input"
                                      type="datetime-local"
                                      value={
                                        m.kickoffAt
                                          ? formatLocalDateTimeInput(
                                              m.kickoffAt
                                            )
                                          : ""
                                      }
                                      onChange={(e) => {
                                        const iso = e.target.value
                                          ? new Date(
                                              e.target.value
                                            ).toISOString()
                                          : null;
                                        setMatchDetails(d.id, m.id, {
                                          field: m.field || "",
                                          kickoffAt: iso,
                                        });
                                        refresh();
                                      }}
                                    />
                                  </label>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </>
                    )}

                    {/* Standings */}
                    {d.matches?.length > 0 && (
                      <>
                        <div className="brkt__sub">Standings</div>
                        {standings.length ? (
                          <div className="brkt__tablewrap">
                            <table className="brkt__table">
                              <thead>
                                <tr>
                                  <th className="brkt__th brkt__th--team">
                                    Team
                                  </th>
                                  <th className="brkt__th">GP</th>
                                  <th className="brkt__th">W</th>
                                  <th className="brkt__th">D</th>
                                  <th className="brkt__th">L</th>
                                  <th className="brkt__th">GF</th>
                                  <th className="brkt__th">GA</th>
                                  <th className="brkt__th">GD</th>
                                  <th className="brkt__th">Pts</th>
                                </tr>
                              </thead>
                              <tbody>
                                {standings.map((row) => {
                                  const t = getTeamById(row.teamId);
                                  return (
                                    <tr key={row.teamId}>
                                      <td className="brkt__td brkt__td--team">
                                        {t?.name || "Team"}
                                      </td>
                                      <td className="brkt__td">{row.gp}</td>
                                      <td className="brkt__td">{row.w}</td>
                                      <td className="brkt__td">{row.d}</td>
                                      <td className="brkt__td">{row.l}</td>
                                      <td className="brkt__td">{row.gf}</td>
                                      <td className="brkt__td">{row.ga}</td>
                                      <td className="brkt__td">{row.gd}</td>
                                      <td className="brkt__td">{row.pts}</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <p className="brkt__muted">
                            Enter scores to see standings.
                          </p>
                        )}
                      </>
                    )}

                    {d.published ? (
                      <p className="brkt__pub brkt__pub--on">
                        Published — visible on the public tournament page.
                      </p>
                    ) : (
                      <p className="brkt__pub">
                        Not published — hidden from the public view.
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
