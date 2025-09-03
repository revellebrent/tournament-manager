import { Link } from "react-router-dom";
import "./Header.css";
import tmlogo from "../../assets/tournamentmanagerlogo2.png";

export default function Header() {
  return (
    <header className="header">
      <div className="header__inner container">
        <Link to="/" className="header__logo" aria-label="Tournament Manager — Home">
          <img className="header__logo-img" src={tmlogo} alt="Tournament Manager Logo" />
          <span className="visually-hidden">Tournament Manager</span>
        </Link>
        <nav className="header__nav">
          <Link to="/" className="header__link">Home</Link>
          <Link to="/director" className="header__link">Director</Link>
          <Link to="/coach" className="header__link">Coach</Link>
          <Link to="/spectator" className="header__link">Spectator</Link>
          <Link to="/profile" className="header__link">Profile</Link>
        </nav>
      </div>
    </header>
  );
}
