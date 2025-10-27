import { Link } from "react-router-dom";
import "./TournamentCard.css";

export default function TournamentCard({ tournament }) {
  if (!tournament) return null;

  const { id, name, dates = [], venue = {} } = tournament;

  return (
    <article className="tcard" aria-labelledby={`t-${id}`}>
      <h3 id={`t-${id}`} className="tcard__title">
        <Link to={`/tournament/${id}`} className="tcard__title-link">
          {name}
        </Link>
      </h3>
      <p className="tcard__venue">{venue?.name || ""}</p>
      <p className="tcard__dates">
        {Array.isArray(dates) ? dates.join(" - ") : String(dates || "")}
      </p>
      <Link to={`/tournament/${id}`} className="tcard__link">
        View Details
      </Link>
    </article>
  );
}
