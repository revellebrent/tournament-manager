import { checkResponse } from './checkResponse.js';

export function getNwsAlerts({ lat, lon }) {
  const url = `https://api.weather.gov/alerts/active?point=${lat},${lon}`;

  return fetch(url, {
    headers: {
      'Accept': 'application/geo+json',
    },
  })
  .then(checkResponse)
  .then((data) => (Array.isArray(data?.features) ? data : { features: [] }))
  .catch(() => ({ features: [] }));
}