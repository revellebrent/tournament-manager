import { Link } from "react-router-dom";
import "./Header.css";
import tmlogo from "../../assets/tournamentmanagerlogo2.png";
import { useAuth } from "../../context/AuthContext";

export default function Header({ onLoginClick, onRegisterClick }) {
  const { isLoggedIn, user, logout } = useAuth();

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

        <div className="header__actions">
          {isLoggedIn ? (
            <>
              <span className="header__user">Hello, {user?.name || "User"}</span>
          <button type="button" className="button header__btn" onClick={logout}>
            Log out
          </button>
            </>
          ) : (
            <>
              <button type="button" className="button header__btn" onClick={onLoginClick}>
                Log in
              </button>
          <button type="button" className="button header__btn" onClick={onRegisterClick}>
            Sign up
          </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
