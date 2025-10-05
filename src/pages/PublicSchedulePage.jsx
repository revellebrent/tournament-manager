import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PublicSchedule from "../components/PublicSchedule/PublicSchedule.jsx";
import "./public-shared.css";

export default function PublicSchedulePage() {
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
        <div className="publicbar__spacer" />
      </div>

      <PublicSchedule tournamentId={tid} />
    </>
  );
}
