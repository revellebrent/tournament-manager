import { Routes, Route } from 'react-router-dom';
import Header from "./components/Header/Header.jsx";
import Home from './components/Home/Home.jsx';
import TournamentDetails from './components/TournamentsDetails/TournamentDetails';
import NotFound from './components/NotFound/NotFound.jsx';

export default function App() {
  return (
    <div className="page">
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tournament/:id" element={<TournamentDetails />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}
