import "./ApplyForm.css";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { listTeamsByCoach, submitApplication } from "../../utils/db";
import { tournaments } from "../../utils/tournaments";

const TIER_OPTIONS = ["Gold", "Silver", "Bronze", "Custom"];
const POOLS = ["", "A", "B", "C", "D", "E", "F", "G", "H"];

export default function ApplyForm({ tournamentId: propTournamentId }) {
  const { user } = useAuth();
  const email = user?.email;

  const [tournamentId, setTournamentId] = useState(
    propTournamentId || tournaments[0]?.id || ""
  );

  const [teams, setTeams] = useState([]);
  const [state, setState] = useState({
    teamId: "",
    tier: "Gold",
    customTier: "",
    poolPref: "",
    sent: false,
  });

  useEffect(() => {
    if (!email) return;
    const list = listTeamsByCoach(email);
    setTeams(list);
    if (list[0]?.id)
      setState((s) => ({ ...s, teamId: s.teamId || list[0].id }));
  }, [email]);

  function handleSubmit(e) {
    e.preventDefault();
    const tier =
      state.tier === "Custom" ? state.customTier || "Custom" : state.tier;

    submitApplication({
      tournamentId,
      teamId: state.teamId,
      coachEmail: email,
      tier,
      poolPref: state.poolPref,
    });

    setState((s) => ({ ...s, sent: true }));
    setTimeout(() => setState((s) => ({ ...s, sent: false })), 1500);
  }

  if (!email) return null;

  if (!teams.length) {
    return (
      <p className="apply__muted">
        Create a team in your Coach dashboard before applying.
      </p>
    );
  }

  return (
    <section className="apply section">
      <h2 className="apply__h2">Apply to a Tournament</h2>
      <p className="apply__intro">
        Choose a tournament, your team, and a bracket (tier). You can add aa pool preference; directors will finalize assignments.
      </p>


    <form className="apply__form" onSubmit={handleSubmit}>
      <div className="apply__grid">
        {!propTournamentId && (
        <label className="field">
          <span className="field__label">Tournament</span>
          <select
            className="field__input"
            value={tournamentId}
            onChange={(e) => setTournamentId(e.target.value)}
            required
          >
            {tournaments.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
      )}

      <label className="field">
        <span className="field__label">Team</span>
        <select
          className="field__input"
          value={state.teamId}
          onChange={(e) => setState((s) => ({ ...s, teamId: e.target.value }))}
          required
        >
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} — {t.ageGroup}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span className="field__label">Tier</span>
        <select
          className="field__input"
          value={state.tier}
          onChange={(e) => setState((s) => ({ ...s, tier: e.target.value }))}
        >
          {TIER_OPTIONS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>

      {state.tier === "Custom" && (
        <label className="field">
          <span className="field__label">Custom Tier</span>
          <input
            className="field__input"
            value={state.customTier}
            onChange={(e) =>
              setState((s) => ({ ...s, customTier: e.target.value }))
            }
            placeholder="e.g. Platinum"
            required
          />
        </label>
      )}
      </div>

      <div className="apply__row">
      <label className="field">
        <span className="field__label">Pool Preference</span>
        <select
          className="field__input"
          value={state.poolPref}
          onChange={(e) =>
            setState((s) => ({ ...s, poolPref: e.target.value }))
          }
        >
          {POOLS.map((p) => (
            <option key={p} value={p}>
              {p ? `Pool ${p}` : "No preference"}
            </option>
          ))}
        </select>
      </label>
      </div>

      <div className="apply__actions">
      <button className="button apply__button" type="submit">
        Submit application
      </button>
      </div>

      <div className="apply__card" aria-live="polite">
        <strong>Preview</strong>
        <div className="apply__muted">
            {tournaments.find((t) => t.id === tournamentId)?.name || "—"} ·{" "}
            {teams.find((t) => t.id === state.teamId)?.name || "—"} ·{" "}
            {state.tier === "Custom" ? (state.customTier || "—") : state.tier} ·{" "}
            {state.poolPref ? `Pool ${state.poolPref}` : "No pool preference"}
          </div>
        </div>

      {state.sent && <p className="apply__success">Application submitted!</p>}
    </form>
    </section>
  );
}
