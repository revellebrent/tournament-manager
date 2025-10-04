import { useParams } from "react-router-dom";
import PublicSchedule from "../components/PublicSchedule/PublicSchedule.jsx";

export default function PublicSchedulePage() {
  const { tid } = useParams();
  return <PublicSchedule tournamentId={tid} />;
}