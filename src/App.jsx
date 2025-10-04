import { useState, useEffect } from "react";
import { Routes, Route, useParams, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ensureUser, upsertUserRole } from "./utils/db";

import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute.jsx";
import Header from "./components/Header/Header.jsx";
import DashboardRouter from "./components/DashboardRouter/DashboardRouter.jsx";
import Home from "./components/Home/Home.jsx";
import TournamentDetails from "./components/TournamentDetails/TournamentDetails";
import LoginModal from "./components/LoginModal/LoginModal.jsx";
import RegisterModal from "./components/RegisterModal/RegisterModal.jsx";
import Profile from "./components/Profile/Profile.jsx";
import NotFound from "./components/NotFound/NotFound.jsx";
import ScheduleBoard from "./components/ScheduleBoard/ScheduleBoard.jsx";

import PublicStandingsPage from "./pages/PublicStandingsPage.jsx";
import PublicSchedulePage from "./pages/PublicSchedulePage.jsx";

function AppShell() {
  const [isLoginOpen, setLoginOpen] = useState(false);
  const [isRegisterOpen, setRegisterOpen] = useState(false);
  const auth = useAuth();

  useEffect(() => {
    if (auth?.user?.email) {
      ensureUser({
        email: auth.user.email,
        role: auth.role,
        name: auth.user.name,
      });
      upsertUserRole(auth.user.email, auth.role);
    }
  }, [auth?.user?.email, auth.role, auth.user?.name]);

  return (
    <div className="page">
      <div className="page__surface">
        <Header
          onLoginClick={() => setLoginOpen(true)}
          onRegisterClick={() => setRegisterOpen(true)}
        />
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/tournament/:id" element={<TournamentDetails />} />
          <Route path="/public/:tid/schedule" element={<PublicSchedulePage />} />
          <Route path="/public/:tid/standings" element={<PublicStandingsPage />} />

          {/* Private */}
          <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={["coach", "director", "parent"]}>
              <DashboardRouter />
            </ProtectedRoute>
          }
          />
           <Route
            path="/profile"
            element={
              <ProtectedRoute roles={["coach", "director", "parent"]}>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/director/schedule/:id"
            element={
              <ProtectedRoute roles={["director"]}>
                <ScheduleBoardWrapper />
              </ProtectedRoute>
            }
          />

          {/* Legacy redirects */}
          <Route path="/director" element={<Navigate to="/dashboard" replace />} />
          <Route path="/coach" element={<Navigate to="/dashboard" replace />} />
          <Route path="/spectator" element={<Navigate to="/dashboard" replace />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setLoginOpen(false)}
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.target);
          const email = fd.get("email") || "";
          const role = fd.get("role") || "coach";
          auth.login({ role, name: email.split("@")[0] || "User", email });
          setLoginOpen(false);
        }}
      />

      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setRegisterOpen(false)}
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.target);
          const email = fd.get("email") || "";
          auth.login({
            role: "parent",
            name: fd.get("name") || "Parent",
            email,
          });
          setRegisterOpen(false);
        }}
      />
    </div>
  );
}

function ScheduleBoardWrapper() {
  const { id } = useParams();
  return <ScheduleBoard tournamentId={id} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
