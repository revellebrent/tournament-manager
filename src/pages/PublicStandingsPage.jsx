import { useNavigate, useParams } from "react-router-dom";

import PublicStandings from "../components/PublicStandings/PublicStandings.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import "./public-shared.css";

export default function PublicStandingsPage() {
  const { tid } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(isLoggedIn ? "/dashboard" : "/spectator");
    }
  };

  return (
    <>
      <div className="publicbar container">
        <button type="button" className="publicbar__back" onClick={goBack}>
          ← Back{isLoggedIn ? " to Dashboard" : ""}
        </button>
      </div>

      <PublicStandings tournamentId={tid} />
    </>
  );
}
