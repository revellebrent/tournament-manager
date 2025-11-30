import { useEffect, useState } from "react";
import {
  Navigate,
  Route,
  Routes,
  useNavigate,
  useParams,
} from "react-router-dom";

import SignUp from "@/pages/SignUp";
import DashboardRouter from "./components/DashboardRouter/DashboardRouter.jsx";
import Footer from "./components/Footer/Footer.jsx";
import Header from "./components/Header/Header.jsx";
import Home from "./components/Home/Home.jsx";
import LoginModal from "./components/LoginModal/LoginModal.jsx";
import NotFound from "./components/NotFound/NotFound.jsx";
import Profile from "./components/Profile/Profile.jsx";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute.jsx";
import RegisterModal from "./components/RegisterModal/RegisterModal.jsx";
import ScheduleBoard from "./components/ScheduleBoard/ScheduleBoard.jsx";
import SpectatorDashboard from "./components/SpectatorDashboard/SpectatorDashboard.jsx";
import TournamentDetails from "./components/TournamentDetails/TournamentDetails.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import PublicSchedulePage from "./pages/PublicSchedulePage.jsx";
import PublicStandingsPage from "./pages/PublicStandingsPage.jsx";
import { ensureUser, upsertUserRole } from "./utils/db";

function ScheduleBoardWrapper() {
  const { id } = useParams();
  return <ScheduleBoard tournamentId={id} />;
}

function AppShell() {
  const [isLoginOpen, setLoginOpen] = useState(false);
  const [isRegisterOpen, setRegisterOpen] = useState(false);
  const auth = useAuth();
  const navigate = useNavigate();

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
    <div className="page" id="top">
      <a href="#main" className="skiplink">
        Skip to content
      </a>

      <main id="main" className="page__surface">
        <Header
          onLoginClick={() => setLoginOpen(true)}
          onRegisterClick={() => setRegisterOpen(true)}
        />

        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/tournament/:id" element={<TournamentDetails />} />
          <Route path="/spectator" element={<SpectatorDashboard />} />
          <Route
            path="/public/:tid/schedule"
            element={<PublicSchedulePage />}
          />
          <Route
            path="/public/:tid/standings"
            element={<PublicStandingsPage />}
          />
          <Route path="/signup" element={<SignUp />} />

          {/* Legacy redirects */}
          <Route
            path="/director"
            element={<Navigate to="/dashboard" replace />}
          />
          <Route path="/coach" element={<Navigate to="/dashboard" replace />} />

          {/* Private */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute
                roles={["coach", "director", "parent", "spectator"]}
              >
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

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setLoginOpen(false)}
        onSubmit={async (e) => {
          const fd = new FormData(e.target);
          const email = String(fd.get("email") || "");
          const password = String(fd.get("password") || "");
          await auth.login(email, password); // now valid
          setLoginOpen(false);
          navigate("/dashboard");
        }}
      />

      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setRegisterOpen(false)}
        onSubmit={async (e) => {
          const fd = new FormData(e.target);
          const name = String(fd.get("name") || "");
          const email = String(fd.get("email") || "");
          const password = String(fd.get("password") || "");
          const role = String(fd.get("role") || "parent");

          await auth.register({ name, email, password, role });

          await auth.login(email, password);

          setRegisterOpen(false);
          navigate("/dashboard");
        }}
      />
    </div>
  );
}

export default function App() {
  return <AppShell />;
}
