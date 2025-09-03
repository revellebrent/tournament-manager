import { checkResponse } from './checkResponse.js';

export function getForecast({ lat, lon, startDate, endDate }) {
  const url = new URL ('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', lat);
  url.searchParams.set('longitude', lon);
  url.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min,precipitation_probability_max');
  url.searchParams.set('hourly', 'temperature_2m,precipitation_probability,weathercode');
  url.searchParams.set('timezone', 'auto');
  url.searchParams.set('temperature_unit', 'fahrenheit');

  if (startDate) url.searchParams.set('start_date', startDate);
  if (endDate) url.searchParams.set('end_date', endDate);

  return fetch(url.toString(), { method: 'GET' })
    .then(checkResponse)
    .catch(() => { throw new Error('Forecast unavailable'); });
}