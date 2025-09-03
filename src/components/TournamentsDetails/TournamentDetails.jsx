import "./TournamentDetails.css";
import { useParams, Link } from "react-router-dom";
import { tournaments } from "../../utils/tournaments";
import AlertBanner from "../AlertBanner/AlertBanner";

export default function TournamentDetails() {
  const { id } = useParams();
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
        <p className="details__text">
          Forecast for this venue will appear here.
        </p>
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
          {t.divisions.map((d) => <li key={d}>{d}</li>)}
        </ul>
      </section>
    </main>
  );
}
