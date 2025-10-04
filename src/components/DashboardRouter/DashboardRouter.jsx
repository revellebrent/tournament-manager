import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function DashboardRouter() {
  const { role } = useAuth;
  if (role === "director") return <Navigate to="/director" replace />;
  if (role === "coach") return <Navigate to="/coach" replace />;
  if (role === "parent") return <Navigate to="/profile" replace />;
  return <Navigate to="/" replace />;
}