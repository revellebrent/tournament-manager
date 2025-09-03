import { useEffect, useState } from "react";
import "./WeatherPanel.css";
import { getForecast } from "../../utils/openMeteo";

export default function WeatherPanel({ lat, lon, startDate, endDate }) {
  const [state, setState] = useState({ loading: true, error: "", data: null });

  useEffect(() => {
    let cancelled = false;
    setState({ loading: true, error: "", data: null });

    getForecast({ lat, lon, startDate, endDate })
      .then((data) => {
        if (!cancelled) setState({ loading: false, error: "", data });
      })
      .catch(() => {
        if (!cancelled)
          setState({
            loading: false,
            error: "Failed to load forecast",
            data: null,
          });
      });

    return () => {
      cancelled = true;
    };
  }, [lat, lon, startDate, endDate]);

  if (state.loading) return <div className="weather"><div className="weather__loading">Loading forecast...</div></div>;


  if (state.error) return <div className="weather"><div className="weather__error">{state.error}</div></div>;

  if (!state.data?.daily) return <div className="weather"><div className="weather__empty">No forecast data available.</div></div>;

  const d = state.data.daily;

  return (
    <div className="weather">
      <div className="weather__grid">
        {d.time.map((date, i) => (
          <div className="weather__day" key={date}>
          <div className="weather__date">{date}</div>
          <div className="weather__temps">
            <span className="weather__temp-max">{Math.round(d.temperature_2m_max[i])}°F</span>
            <span className="weather__sep">/</span>
            <span className="weather__temp-min">{Math.round(d.temperature_2m_min[i])}°F</span>
          </div>
          <div className="weather__precip">Precip: {d.precipitation_probability_max?.[i] ?? 0}%</div>
        </div>
      ))}
    </div>
  </div>
  );
}
