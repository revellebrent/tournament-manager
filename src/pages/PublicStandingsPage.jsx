import { useParams } from "react-router-dom";
import PublicStandings from "../components/PublicStandings/PublicStandings";

export default function PublicStandingsPage() {
  const { tid } = useParams();
  return <PublicStandings tournamentId={tid} />;
}