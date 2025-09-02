import "./Home.css";
import { tournaments } from "../../utils/tournaments";
import TournamentCard from "../TournamentCard/TournamentCard";

export default function Home() {
  return (
    <main className="home container">
      <h1 className="home__title">Upcoming Tournaments</h1>
      <div className="home__grid">
        {tournaments.length === 0 ? (
          <div className="home__empty">No tournaments available</div>
        ) : (
          tournaments.map((t) => <TournamentCard key={t.id} t={t} />)
        )}
      </div>
    </main>
  );
}
