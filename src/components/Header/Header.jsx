import { useEffect, useRef, useState, useId } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import "./Header.css";
import tmlogo from "../../assets/tournamentmanagerlogo2.png";
import { useAuth } from "../../context/AuthContext";

export default function Header({ onLoginClick, onRegisterClick }) {
  const { isLoggedIn, user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const menuId = useId();

  const location = useLocation();
  useEffect(() => {
    setOpen(false);
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!menuRef.current?.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const navItems = [
    { to: "/", label: "Home" },
    { to: "/spectator", label: "Spectator" },
  ];

  const initials = (() => {
    const name = (user?.name || user?.email || "U").trim();
    const parts = name.split(/\s+/);
    return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "") || "U").toUpperCase();
  })();

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="header">
      <div className="header__inner container">
        <Link
          to="/"
          className="header__logo"
          aria-label="Tournament Manager — Home"
        >
          <img
            className="header__logo-img"
            src={tmlogo}
            alt="Tournament Manager Logo"
          />
          <span className="visually-hidden">Tournament Manager</span>
        </Link>

        {/* Desktop nav */}
        <nav className="header__nav">
          {navItems.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              className={({ isActive }) =>
                "header__link" + (isActive ? " header__link--active" : "")
              }
            >
              {it.label}
            </NavLink>
          ))}
        </nav>

        <div className="header__spacer" />

        {/* Desktop auth/actions */}
        <div className="header__actions">
          {isLoggedIn ? (
            <div className="header__user-menu" ref={menuRef}>
              <button
                type="button"
                className="header__user-btn"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-controls={menuId}
                onClick={() => setMenuOpen((v) => !v)}
              >
                <span className="header__avatar" aria-hidden="true">
                  {initials}
                </span>
                <span className="header__user-label">
                  {user?.name || user?.email}
                </span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    d="M5 7l5 5 5-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </button>

              {menuOpen && (
                <div id={menuId} className="header__menu" role="menu">
                  <Link
                    to="/dashboard"
                    role="menuitem"
                    className="header__menu-item"
                    onClick={() => setMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/profile"
                    role="menuitem"
                    className="header__menu-item"
                    onClick={() => setMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    className="header__menu-item header__menu-item--danger"
                    onClick={() => {
                      setMenuOpen(false);
                      logout();
                    }}
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button
                type="button"
                className="button header__btn"
                onClick={onLoginClick}
              >
                Log in
              </button>
              <button
                type="button"
                className="button header__btn"
                onClick={onRegisterClick}
              >
                Sign up
              </button>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="header__burger"
          aria-label="Toggle menu"
          aria-expanded={open}
          aria-controls="header-mobile"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="header__burger-line" />
          <span className="header__burger-line" />
          <span className="header__burger-line" />
        </button>
      </div>

      {/* Mobile panel */}
      <div
        id="header-mobile"
        className={`header__mobile ${open ? "header__mobile--open" : ""}`}
      >
        <nav className="header__m-nav" onClick={() => setOpen(false)}>
          {navItems.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              className={({ isActive }) =>
                "header__m-link" + (isActive ? " header__m-link--active" : "")
              }
            >
              {it.label}
            </NavLink>
          ))}
          {isLoggedIn && (
            <>
              <NavLink to="/dashboard" className="header__m-link">
                Dashboard
              </NavLink>
              <NavLink to="/profile" className="header__m-link">
                Profile
              </NavLink>
            </>
          )}
        </nav>

        <div className="header__m-auth">
          {isLoggedIn ? (
            <>
              <div className="header__m-user">
                <div className="header__m-user-name">
                  {user?.name || user?.email}
                </div>
              </div>
              <button
                type="button"
                className="button header__btn"
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="button header__btn"
                onClick={() => {
                  onLoginClick?.();
                  setOpen(false);
                }}
              >
                Log in
              </button>
              <button
                type="button"
                className="button header__btn"
                onClick={() => {
                  onRegisterClick?.();
                  setOpen(false);
                }}
              >
                Sign up
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
