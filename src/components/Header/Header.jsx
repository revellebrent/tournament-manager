import { Link } from "react-router-dom";
import "./Header.css";

export default function Header() {
  return (
    <header className="header">
      <div className="header__inner container">
        <Link to="/" className="header__logo">
          Tournament Manager
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
