import "./Footer.css";
import tmlogo3 from "../../assets/tournamentmanager1.png";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer__inner container">
        <div className="footer__brand">
          <img className="footer__logo" src={tmlogo3} alt="app logo" aria-hidden="true" />
          <div className="footer__brandtext">
            <span className="footer__name">Tournament Manager</span>
            <span className="footer__sub">Manage • Play • Watch</span>
            <p className="footer__copy">© {year} Tournament Manager</p>
          </div>
        </div>
      </div>
    </footer>
  );
}