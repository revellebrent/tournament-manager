import "./TournamentCard.css";
import { Link } from "react-router-dom";

export default function TournamentCard({ t }) {
  return (
    <article className="tcard">
      <h3 className="tcard__title">{t.name}</h3>
      <p className="tcard__venue">{t.venue.name}</p>
      <p className="tcard__dates">{t.dates.join(" - ")}</p>
      <Link to={`/tournament/${t.id}`} className="tcard__link">View Details</Link>
    </article>
  );
}