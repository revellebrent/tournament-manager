import { useAuth } from "../../context/AuthContext";
import DirectorDashboard from "../DirectorDashboard/DirectorDashboard.jsx";
import CoachDashboard from "../CoachDashboard/CoachDashboard.jsx";
import SpectatorDashboard from "../SpectatorDashboard/SpectatorDashboard.jsx";

export default function DashboardRouter() {
  const { role, isLoggedIn } = useAuth();

  if (!isLoggedIn || !role) return null;

  if (role === "director") return <DirectorDashboard />;
  if (role === "coach") return <CoachDashboard />;
  return <SpectatorDashboard />;
}