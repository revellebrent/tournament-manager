import { useEffect, useMemo, useState } from "react";
import "./BracketBuilder.css";
import { useAuth } from "../../context/AuthContext";
import {
  listApplicationsByTournament,
  getTeamById,
  listDivisionsByTournament,
  createDivision,
  addTeamToDivision,
  removeTeamFromDivision,
  generateRoundRobin,
  setMatchScore,
  setDivisionPublished,
  computeStandings,
  setMatchDetails,
} from "../../utils/db";

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

  const toLocalInput = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
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

        <button className="button" type="submit">
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
                return (
                  <li key={d.id} className="brkt__card">
                    <div className="brkt__cardhead">
                      <strong>{d.name}</strong>
                      <div className="brkt__headactions">
                        <button
                          className="button"
                          type="button"
                          onClick={() => {
                            generateRoundRobin(d.id);
                            refresh();
                          }}
                        >
                          Generate Round-Robin
                        </button>

                        <button
                          className="button"
                          type="button"
                          onClick={() => {
                            setDivisionPublished(d.id, !d.published);
                            refresh();
                          }}
                          title={
                            d.published
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
                                onClick={() => handleRemoveTeam(d.id, tid)}
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
                        <span className="field__label">Kickoff</span>
                        <input
                        className="field__input"
                        type="datetime-local"
                        value={m.kickoffAt ? toLocalInput(m.kickoffAt) : ""}
                        onChange={(e) => {
                          const iso = e.target.value ? new Date(e.target.value).toISOString() : null;
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
