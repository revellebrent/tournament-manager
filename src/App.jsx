import { useState } from "react";
import { Routes, Route } from "react-router-dom";
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

export default function App() {
  const [isLoginOpen, setLoginOpen] = useState(false);
  const [isRegisterOpen, setRegisterOpen] = useState(false);
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
          <Route path="/director" element={<DirectorDashboard />} />
          <Route path="/coach" element={<CoachDashboard />} />
          <Route path="/spectator" element={<SpectatorDashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setLoginOpen(false)}
        onSubmit={(e) => {
          e.preventDefault();
          setLoginOpen(false);
        }}
      />

      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setRegisterOpen(false)}
        onSubmit={(e) => {
          e.preventDefault();
          setRegisterOpen(false);
        }}
      />
    </div>
  );
}
