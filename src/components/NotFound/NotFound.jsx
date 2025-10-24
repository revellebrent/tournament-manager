import { Link } from "react-router-dom";
import "./NotFound.css";

export default function NotFound() {
  return (
    <main className="notfound container">
      <h1 className="notfound__title">404 - Page Not Found</h1>
      <p className="notfound__message">
        Sorry, the page you are looking for does not exist.
      </p>
      <Link to="/" className="notfound__link">
        ← Back to Home
      </Link>
    </main>
  );
}
