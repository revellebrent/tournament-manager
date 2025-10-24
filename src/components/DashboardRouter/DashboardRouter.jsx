import { useAuth } from "../../context/AuthContext.jsx";
import CoachDashboard from "../CoachDashboard/CoachDashboard.jsx";
import DirectorDashboard from "../DirectorDashboard/DirectorDashboard.jsx";
import SpectatorDashboard from "../SpectatorDashboard/SpectatorDashboard.jsx";

export default function DashboardRouter() {
  const { role, isLoggedIn } = useAuth();

  if (!isLoggedIn || !role) return null;

  if (role === "director") return <DirectorDashboard />;
  if (role === "coach") return <CoachDashboard />;
  return <SpectatorDashboard />;
}
