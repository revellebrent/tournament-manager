import { Routes, Route } from "react-router-dom";
import Header from "./components/Header/Header.jsx";
import Home from "./components/Home/Home.jsx";
import TournamentDetails from "./components/TournamentsDetails/TournamentDetails";
import DirectorDashboard from "./components/DirectorDashboard/DirectorDashboard.jsx";
import CoachDashboard from "./components/CoachDashboard/CoachDashboard.jsx";
import SpectatorDashboard from "./components/SpectatorDashboard/SpectatorDashboard.jsx";
import Profile from "./components/Profile/Profile.jsx";
import NotFound from "./components/NotFound/NotFound.jsx";

export default function App() {
  return (
    <div className="page">
      <div className="page__surface">
        <Header />
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
    </div>
  );
}
