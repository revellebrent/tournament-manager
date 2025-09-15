import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute.jsx";
import Header from "./components/Header/Header.jsx";
import Home from "./components/Home/Home.jsx";
import TournamentDetails from "./components/TournamentDetails/TournamentDetails";
import LoginModal from "./components/LoginModal/LoginModal.jsx";
import RegisterModal from "./components/RegisterModal/RegisterModal.jsx";
import DirectorDashboard from "./components/DirectorDashboard/DirectorDashboard.jsx";
import CoachDashboard from "./components/CoachDashboard/CoachDashboard.jsx";
import SpectatorDashboard from "./components/SpectatorDashboard/SpectatorDashboard.jsx";
import Profile from "./components/Profile/Profile.jsx";
import NotFound from "./components/NotFound/NotFound.jsx";

function AppShell() {
  const [isLoginOpen, setLoginOpen] = useState(false);
  const [isRegisterOpen, setRegisterOpen] = useState(false);
  const auth = useAuth();

  return (
    <div className="page">
      <div className="page__surface">
        <Header
          onLoginClick={() => setLoginOpen(true)}
          onRegisterClick={() => setRegisterOpen(true)}
        />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tournament/:id" element={<TournamentDetails />} />
          <Route
            path="/director"
            element={
              <ProtectedRoute roles={["director"]}>
                <DirectorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/coach"
            element={
              <ProtectedRoute roles={["coach", "director"]}>
                <CoachDashboard />
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
          <Route path="/spectator" element={<SpectatorDashboard />} />
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
          // Demo login: any password is accepted
          auth.login({ role: "coach", name: email.split("@")[0] || "Coach", email });
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
          auth.login({ role: "parent", name: fd.get("name") || "Parent", email });
          setRegisterOpen(false);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
