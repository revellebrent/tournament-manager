import "./TournamentDetails.css";
import { useParams, Link } from "react-router-dom";
import { tournaments } from "../../utils/tournaments";
import AlertBanner from "../AlertBanner/AlertBanner";
import WeatherPanel from "../WeatherPanel/WeatherPanel";
import ApplyForm from "../ApplyForm/ApplyForm";
import BracketBuilder from "../BracketBuilder/BracketBuilder";
import BracketReadOnly from "../BracketReadOnly/BracketReadOnly";
import { useAuth } from "../../context/AuthContext";
import PublicSchedule from "../PublicSchedule/PublicSchedule";

export default function TournamentDetails() {
  const { id } = useParams();
  const { role } = useAuth();
  const t = tournaments.find((x) => x.id === id);

  if (!t) {
    return (
      <main className="details container">
        <p>Sorry, tournament not found</p>
        <Link to="/" className="details__back">
          ← Back to list
        </Link>
      </main>
    );
  }

  const startDate = t.dates[0];
  const endDate = t.dates[t.dates.length - 1];

  return (
    <main className="details container">
      <Link to="/" className="details__back">
        ← Back to list
      </Link>
      <h1 className="details__title">{t.name}</h1>
      <p className="details__meta">{t.dates.join(" - ")}</p>
      <p className="details__meta">
        <strong>Venue:</strong> {t.venue.name}
      </p>
      <p className="details__meta">{t.venue.address}</p>

      <section className="details__section section">
        <h2 className="details__h2">Event Weather</h2>
        <WeatherPanel
          lat={t.venue.lat}
          lon={t.venue.lon}
          startDate={startDate}
          endDate={endDate}
        />
      </section>

      <section className="details__section section">
        <h2 className="details__h2">Severe Weather Alerts</h2>
        <AlertBanner
          lat={t.venue.lat}
          lon={t.venue.lon}
          country={t.venue.country}
        />
      </section>

      <section className="details__section section">
        <h2 className="details__h2">Divisions</h2>
        <ul className="details__list">
          {t.divisions.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      </section>

      <section className="details__section section">
        <h2 className="details__h2">Apply to this tournament</h2>
        {role === "coach" ? (
          <ApplyForm tournamentId={t.id} />
        ) : (
          <p className="details__text">
            Coaches can apply to this tournament here.
          </p>
        )}
      </section>

      <section className="details__section section">
        <h2 className="details__h2">Brackets & Pools</h2>
        {role === "director" ? (
          <BracketBuilder tournamentId={t.id} />
        ) : (
          <BracketReadOnly tournamentId={t.id} />
        )}
      </section>

      <section className="details__section section">
        <h2 className="details__h2">Schedule & Results</h2>
        <PublicSchedule tournamentId={t.id} />
        {role === "director" && (
          <Link
          to={`/director/schedule/${t.id}`}
          className="button details__action"
          >
          Open Schedule Board
          </Link>
        )}
      </section>
    </main>
  );
}
