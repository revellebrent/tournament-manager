import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, NavLink, useLocation } from "react-router-dom";

import hamburgerIcon from "../../assets/hamburger-icon.svg";
import tmlogo from "../../assets/tournamentmanagerlogo2.png";
import { useAuth } from "../../context/AuthContext.jsx";
import "./Header.css";

export default function Header({ onLoginClick, onRegisterClick }) {
  const { isLoggedIn, user, logout } = useAuth();

  // Mobile modal state
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const firstFocusRef = useRef(null);
  const menuId = useId();

  // Desktop user menu state
  const [userOpen, setUserOpen] = useState(false);
  const userBtnRef = useRef(null);
  const userMenuRef = useRef(null);

  const location = useLocation();

  // Close mobile modal on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Body scroll lock when modal is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => firstFocusRef.current?.focus(), 0);
    return () => {
      document.body.style.overflow = prev;
      clearTimeout(t);
    };
  }, [open]);

  // Keyboard handling for modal
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e) {
      if (e.key === "Escape") {
        e.stopPropagation();
        setOpen(false);
      }
      if (e.key === "Tab" && menuRef.current) {
        const focusables = menuRef.current.querySelectorAll(
          'a,button,input,select,textarea,[tabindex]:not([tabindex="-1"])'
        );
        const list = Array.from(focusables);
        if (list.length === 0) return;
        const first = list[0];
        const last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // Desktop user menu: click outside + Esc to close
  useEffect(() => {
    if (!userOpen) return;
    function onDocClick(e) {
      if (
        userMenuRef.current?.contains(e.target) ||
        userBtnRef.current?.contains(e.target)
      )
        return;
      setUserOpen(false);
    }
    function onKeyDown(e) {
      if (e.key === "Escape") setUserOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [userOpen]);

  const navItems = [
    { to: "/", label: "Home" },
    { to: "/spectator", label: "Spectator" },
  ];

  const mobileItems = [
    ...navItems,
    ...(isLoggedIn
      ? [
          { to: "/dashboard", label: "Dashboard" },
          { to: "/profile", label: "Profile" },
        ]
      : []),
  ];

  const initials = (() => {
    const name = (user?.name || user?.email || "U").trim();
    const parts = name.split(/\s+/);
    return ((parts[0]?.[0] || "U") + (parts[1]?.[0] || "")).toUpperCase();
  })();

  return (
    <header className="header">
      <a href="#main" className="skiplink">
        Skip to content
      </a>

      <div className="container header__inner">
        <Link
          to="/"
          className="header__logo"
          aria-label="Tournament Manager home"
        >
          <img src={tmlogo} alt="" className="header__logo-img" />
          <span>Tournament Manager</span>
        </Link>

        {/* Desktop nav */}
        <nav className="header__nav" aria-label="Primary">
          {navItems.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                `header__link ${isActive ? "header__link--active" : ""}`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="header__spacer" />

        {/* Desktop actions */}
        <div className="header__actions">
          {!isLoggedIn ? (
            <>
              <button
                type="button"
                className="header__btn"
                onClick={onLoginClick}
              >
                Log in
              </button>
              <button
                type="button"
                className="header__btn"
                onClick={onRegisterClick}
              >
                Sign up
              </button>
            </>
          ) : (
            <div className="header__user-menu">
              <button
                ref={userBtnRef}
                type="button"
                className="header__user-btn"
                aria-haspopup="menu"
                aria-expanded={userOpen}
                onClick={() => setUserOpen((v) => !v)}
              >
                <span className="header__avatar" aria-hidden="true">
                  {initials}
                </span>
                <span className="header__user-label">
                  {user?.name || user?.email || "User"}
                </span>
              </button>

              {userOpen && (
                <div
                  ref={userMenuRef}
                  className="header__menu"
                  role="menu"
                  aria-label="User menu"
                >
                  <Link
                    to="/dashboard"
                    className="header__menu-item"
                    role="menuitem"
                    onClick={() => setUserOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/profile"
                    className="header__menu-item"
                    role="menuitem"
                    onClick={() => setUserOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    className="header__menu-item header__menu-item--danger"
                    role="menuitem"
                    onClick={() => {
                      logout();
                      setUserOpen(false);
                    }}
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Hamburger */}
        <button
          className="header__burger"
          aria-label="Open menu"
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen(true)}
        >
          <img src={hamburgerIcon} alt="" width="18" height="18" />
        </button>
      </div>

      {/* Modal Overlay rendered in portal so it covers the whole page */}
      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="header-overlay" role="presentation">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby={`${menuId}-title`}
              id={menuId}
              className="header__dialog"
              ref={menuRef}
            >
              <div className="header__dialog-header">
                <h2 id={`${menuId}-title`} className="visually-hidden">
                  Menu
                </h2>
                <button
                  ref={firstFocusRef}
                  type="button"
                  className="header__close"
                  onClick={() => setOpen(false)}
                >
                  <span aria-hidden="true">×</span>
                </button>
              </div>

              <nav className="header__m-nav" aria-label="Mobile">
                {mobileItems.map((n) => (
                  <NavLink
                    key={n.to}
                    to={n.to}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `header__m-link ${isActive ? "header__m-link--active" : ""}`
                    }
                  >
                    {n.label}
                  </NavLink>
                ))}
              </nav>

              <div className="header__m-auth">
                {!isLoggedIn ? (
                  <>
                    <button
                      type="button"
                      className="header__btn"
                      onClick={() => {
                        onLoginClick?.();
                        setOpen(false);
                      }}
                    >
                      Log in
                    </button>
                    <button
                      type="button"
                      className="header__btn"
                      onClick={() => {
                        onRegisterClick?.();
                        setOpen(false);
                      }}
                    >
                      Sign up
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="header__btn header__menu-item--danger"
                    onClick={() => {
                      logout();
                      setOpen(false);
                    }}
                  >
                    Log out
                  </button>
                )}
              </div>
            </div>

            <button
              type="button"
              className="header__backdrop"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
            />
          </div>,
          document.body
        )}
    </header>
  );
}
