import useShowMore from "../../hooks/useShowMore";
import { tournaments } from "../../utils/tournaments";
import TournamentCard from "../TournamentCard/TournamentCard.jsx";
import "./Home.css";

export default function Home() {
  const { items, canShowMore, showMore } = useShowMore(tournaments, 3, 3);

  return (
    <main className="home container">
      <h1 className="home__title">Upcoming Tournaments</h1>

      <div className="home__grid">
        {items.map((t) => (
          <TournamentCard key={t.id} tournament={t} />
        ))}
      </div>

      {canShowMore && (
        <div className="home__actions">
          <button className="button button--secondary" onClick={showMore}>
            Show More
          </button>
        </div>
      )}
    </main>
  );
}
