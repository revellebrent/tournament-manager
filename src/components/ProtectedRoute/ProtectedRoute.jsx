import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ children, roles }) {
  const { isLoggedIn, role } = useAuth();
  if (!isLoggedIn) return <Navigate to="/" replace />;
  if (roles && !roles.includes(role)) return <Navigate to="/" replace />;
  return children;
}