import { Routes, Route } from 'react-router-dom';
import Header from "./components/Header/Header.jsx";
import Home from './components/Home/Home.jsx';
import TournamentDetails from './components/TournamentsDetails/TournamentDetails';

export default function App() {
  return (
    <div className="page">
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tournament/:id" element={<TournamentDetails />} />
      </Routes>
    </div>
  );
}
