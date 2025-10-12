import { useEffect, useState } from "react";
import "./AlertBanner.css";
import { getNwsAlerts } from "../../utils/nwsAlerts.js";
import Preloader from "../Preloader/Preloader.jsx";

export default function AlertBanner({ lat, lon, country }) {
  const [state, setState] = useState({
    loading: true,
    alerts: [],
    error: "",
    open: true,
  });

  useEffect(() => {
    if (country !== "US") {
      setState({ loading: false, alerts: [], error: "", open: false });
      return;
    }

    let cancelled = false;
    setState({ loading: true, alerts: [], error: "", open: true });

    getNwsAlerts({ lat, lon })
      .then((geo) => {
        if (cancelled) return;
        const alerts = Array.isArray(geo?.features) ? geo.features : [];
        setState({ loading: false, alerts, error: "", open: true });
      })
      .catch(() => {
        if (cancelled) return;
        setState({
          loading: false,
          alerts: [],
          error:
            "Sorry, something went wrong during the request. There may be a connection issue or the server may be down. Please try again later.",
          open: true,
        });
      });

    return () => {
      cancelled = true;
    };
  }, [lat, lon, country]);

  if (!state.open) return null;

  if (state.loading) {
    return (
      <div className="alertbanner alertbanner--info" role="status">
        <Preloader text="Checking weather alerts..." />
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="alertbanner alertbanner--info" role="status">
        {state.error}
        <button
          className="alertbanner__close"
          aria-label="Dismiss"
          onClick={() => setState((s) => ({ ...s, open: false }))}
        >
          ×
        </button>
      </div>
    );
  }

  if (!state.alerts.length) {
    return (
      <div className="alertbanner alertbanner--info" role="status">
        No weather alerts at this time.
        <button
          className="alertbanner__close"
          aria-label="Dismiss"
          onClick={() => setState((s) => ({ ...s, open: false }))}
        >
          ×
        </button>
      </div>
    );
  }

  const a = state.alerts[0];
  const title = a?.properties?.event || "Weather Alert";
  const uri = a?.properties?.uri ?? a?.properties?.id ?? "#";

  return (
    <div className="alertbanner alertbanner--danger" role="alert">
      <p className="alertbanner__text">
        <strong>{title}</strong> — see details for timing and affected areas.{" "}
        <a
          className="alertbanner__link"
          href={uri}
          target="_blank"
          rel="noreferrer"
        >
          More info
        </a>
      </p>
      <button
        className="alertbanner__close"
        aria-label="Dismiss"
        onClick={() => setState((s) => ({ ...s, open: false }))}
      >
        ×
      </button>
    </div>
  );
}
