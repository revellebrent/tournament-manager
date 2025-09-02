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
          </nav>
      </div>
    </header>
  );
}
